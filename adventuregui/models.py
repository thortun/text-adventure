from django.db import models

# Create your models here.

class Adventure(models.Model):
	data = models.TextField(db_column = 'data', blank = True)
