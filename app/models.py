"""
Definition of models.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class Research(models.Model):
    title = models.CharField(max_length=200)
    goals = models.TextField()
    context = models.TextField()
    scope = models.TextField()
    methodology = models.TextField()
    timeline = models.CharField(max_length=100)
    resources = models.TextField(blank=True)
    hypotheses = models.JSONField()  # Store hypotheses as a JSON array
    status = models.CharField(max_length=20, default='in_progress')
    progress = models.IntegerField(default=0)  # Store progress as percentage
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Research Projects'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
