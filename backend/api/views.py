from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer, RequestForPaymentSerializer, DepartmentSerializer, SourceOfFundSerializer, TransactionTypeSerializer, TypeOfBusinessSerializer, ModeOfPaymentSerializer, TaxRegistrationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, RequestForPayment, Department, SourceOfFund, TransactionType, TypeOfBusiness, ModeOfPayment, TaxRegistration

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)  # Allow anyone to register

class RequestForPaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = RequestForPaymentSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return RequestForPayment.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class DepartmentListCreateView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return Department.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class SourceOfFundListCreateView(generics.ListCreateAPIView):
    serializer_class = SourceOfFundSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return SourceOfFund.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class TransactionTypeListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionTypeSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return TransactionType.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class TypeOfBusinessListCreateView(generics.ListCreateAPIView):
    serializer_class = TypeOfBusinessSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return TypeOfBusiness.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class ModeOfPaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = ModeOfPaymentSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return ModeOfPayment.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

class TaxRegistrationListCreateView(generics.ListCreateAPIView):
    serializer_class = TaxRegistrationSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return TaxRegistration.objects.all()
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

