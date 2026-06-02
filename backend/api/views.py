from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import LoginRecord, Plant
from .serializers import PlantSerializer, RegisterSerializer


def get_client_ip(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        return forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


def user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    }


def plant_payload(plant):
    return PlantSerializer(plant).data


def find_plant(message):
    normalized = message.lower().strip()
    for plant in Plant.objects.all():
        plant_name = plant.name.lower()
        if plant_name in normalized or normalized in plant_name:
            return plant
    return None


def build_plant_reply(plant):
    return (
        f"{plant.name} ({plant.botanical_name}) belongs to the "
        f"{plant.family} family. Main parts used: "
        f"{', '.join(plant.parts_used)}. Common uses: "
        f"{' '.join(plant.uses)} Preparation: {plant.preparation} "
        f"Caution: {plant.caution}"
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {'token': token.key, 'user': user_payload(user)},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    user = authenticate(username=username, password=password)
    success = user is not None

    LoginRecord.objects.create(
        username=username or 'unknown',
        success=success,
        ip_address=get_client_ip(request),
    )

    if not success:
        return Response(
            {'detail': 'Invalid username or password.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': user_payload(user)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response({'user': user_payload(request.user)})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def plant_list(request):
    if request.method == 'GET':
        plants = Plant.objects.all()
        return Response({'plants': PlantSerializer(plants, many=True).data})

    if not request.user.is_staff:
        return Response(
            {'detail': 'Only admin users can add plant details.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = PlantSerializer(data=request.data)
    if serializer.is_valid():
        plant = serializer.save()
        return Response({'plant': plant_payload(plant)}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def plant_detail(request, plant_id):
    if not request.user.is_staff:
        return Response(
            {'detail': 'Only admin users can delete plant details.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        plant = Plant.objects.get(id=plant_id)
    except Plant.DoesNotExist:
        return Response({'detail': 'Plant not found.'}, status=status.HTTP_404_NOT_FOUND)

    plant.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot(request):
    message = request.data.get('message', '')
    plant = find_plant(message)

    if plant is None:
        plant_names = ', '.join(Plant.objects.values_list('name', flat=True))
        return Response({
            'reply': f'I do not have details for that plant yet. Try one of these: {plant_names}.',
            'plant': None,
        })

    return Response({'reply': build_plant_reply(plant), 'plant': plant_payload(plant)})
