from django.db import models
from django.contrib.auth.models import User

class Note(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class RequestForPayment(models.Model):
    id = models.AutoField(primary_key=True)
    requestedBy = models.CharField(max_length=500)
    payableTo = models.CharField(max_length=500)
    description = models.TextField()
    dateRequested = models.DateField(auto_now_add=True)
    dateNeeded = models.DateField()

    # bank details
    bankName = models.CharField(max_length=200)
    accountName = models.CharField(max_length=500)
    accountNumber = models.CharField(max_length=20)
    swiftCode = models.CharField(max_length=20, blank=True, null=True)
    contactPerson = models.CharField(max_length=500)
    contactNumber = models.CharField(max_length=20)
    email = models.EmailField()

    # payment schedule
    termsOfPayment = models.TextField()
    pr=models.CharField(max_length=100)
    po=models.CharField(max_length=100)
    rr=models.CharField(max_length=100)

    # payee information
    tin = models.CharField(max_length=20)
    payeeAddress = models.TextField()

    #payment details
    currency = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=9,decimal_places=2)
    serviceFee = models.DecimalField(max_digits=9,decimal_places=2)
    lessEWT = models.DecimalField(max_digits=9,decimal_places=2)
    netTotal = models.DecimalField(max_digits=9,decimal_places=2)

    #instructions
    instructions = models.TextField(blank=True, null=True)

    #relationships
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, related_name='rfps')
    sourceOfFund = models.ForeignKey('SourceOfFund', on_delete=models.SET_NULL, null=True, related_name='rfps')
    transactionType = models.ForeignKey('TransactionType', on_delete=models.SET_NULL, null=True, related_name='rfps')
    typeOfBusiness = models.ForeignKey('TypeOfBusiness', on_delete=models.SET_NULL, null=True, related_name='rfps')
    modeOfPayment = models.ForeignKey('ModeOfPayment', on_delete=models.SET_NULL, null=True, related_name='rfps')
    taxRegistration = models.ForeignKey('TaxRegistration', on_delete=models.SET_NULL, null=True, related_name='rfps')

    def __str__(self):
        return self.id

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    costCenter = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class SourceOfFund(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class TransactionType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class TypeOfBusiness(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class ModeOfPayment(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class TaxRegistration(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    



    
