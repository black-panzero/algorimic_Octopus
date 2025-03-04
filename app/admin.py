from django.contrib import admin
from .models import Research

@admin.register(Research)
class ResearchAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'progress', 'created_by', 'created_at', 'updated_at')
    list_filter = ('status', 'created_by', 'created_at')
    search_fields = ('title', 'goals', 'context')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'goals', 'context', 'scope')
        }),
        ('Research Details', {
            'fields': ('methodology', 'timeline', 'resources', 'hypotheses')
        }),
        ('Progress', {
            'fields': ('status', 'progress')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        })
    )

    def save_model(self, request, obj, form, change):
        if not change:  # If creating a new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change) 