from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


class PlantPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.normal_user = User.objects.create_user(
            username='normal_client',
            password='password123',
        )
        self.admin_user = User.objects.create_user(
            username='staff_admin',
            password='password123',
            is_staff=True,
        )
        self.payload = {
            'name': 'Admin Test Plant',
            'botanical_name': 'Admin botanical',
            'family': 'Admin family',
            'uses': ['test'],
            'parts_used': ['leaf'],
            'preparation': 'test',
            'caution': 'test',
        }

    def login(self, username):
        response = self.client.post(
            '/api/login/',
            {'username': username, 'password': 'password123'},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {response.data['token']}")
        return response

    def test_normal_user_cannot_add_plant(self):
        self.login('normal_client')
        response = self.client.post('/api/plants/', self.payload, format='json')
        self.assertEqual(response.status_code, 403)

    def test_admin_user_can_add_and_delete_plant(self):
        login_response = self.login('staff_admin')
        self.assertTrue(login_response.data['user']['is_staff'])

        add_response = self.client.post('/api/plants/', self.payload, format='json')
        self.assertEqual(add_response.status_code, 201)

        plant_id = add_response.data['plant']['id']
        delete_response = self.client.delete(f'/api/plants/{plant_id}/')
        self.assertEqual(delete_response.status_code, 204)
