from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, RequestForPayment, Department, SourceOfFund, TransactionType, TypeOfBusiness, ModeOfPayment, TaxRegistration

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'author', 'title', 'content', 'created_at']
        extra_kwargs = {'author': {'read_only': True}}

class RequestForPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestForPayment
        fields = ['id', 'requestBy', 'payableTo', 'description', 'dateRequested', 'dateNeeded',
                  'bankName', 'accountName', 'accountNumber', 'swiftCode', 'contactPerson', 'contactNumber', 'email',
                  'termsOfPayment', 'pr', 'po', 'rr', 'tin', 'payeeAddress',
                  'currency', 'amount', 'serviceFee', 'lessEWT', 'netTotal', 'instructions',
                  'department', 'sourceOfFund', 'transactionType', 'typeOfBusiness', 'modeOfPayment', 'taxRegistration']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['name','costCenter']

class SourceOfFundSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceOfFund
        fields = ['name']

class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = ['name']

class TypeOfBusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeOfBusiness
        fields = ['name']

class ModeOfPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeOfPayment
        fields = ['name']

class TaxRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRegistration
        fields = ['name']



