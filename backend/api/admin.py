from django.contrib import admin

from .models import LoginRecord, Plant


@admin.register(LoginRecord)
class LoginRecordAdmin(admin.ModelAdmin):
    list_display = ('username', 'success', 'ip_address', 'created_at')
    list_filter = ('success', 'created_at')
    search_fields = ('username', 'ip_address')


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ('name', 'botanical_name', 'family', 'updated_at')
    search_fields = ('name', 'botanical_name', 'family')

# Register your models here.
