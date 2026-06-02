from django.db import models


class LoginRecord(models.Model):
    username = models.CharField(max_length=150)
    success = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        status = 'success' if self.success else 'failed'
        return f'{self.username} - {status} at {self.created_at:%Y-%m-%d %H:%M}'


class Plant(models.Model):
    name = models.CharField(max_length=120, unique=True)
    botanical_name = models.CharField(max_length=160)
    family = models.CharField(max_length=120)
    uses = models.JSONField(default=list)
    parts_used = models.JSONField(default=list)
    preparation = models.TextField()
    caution = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
