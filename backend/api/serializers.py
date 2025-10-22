#serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, RequestForPayment, Department, SourceOfFund, TransactionType, TypeOfBusiness, ModeOfPayment, TaxRegistration, ForecastRun, ForecastResult, DriversMonthly, MacroMonthly, Scenario, ScenarioDeptFactor, ScenarioTxnFactor

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

class ForecastRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastRun
        fields = ['run_at','model_version','horizon_months','scenario','notes']

class ForecastResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastResult
        fields = ['run','month','department','transactionType','p10','p50','p90','mean','reconciled','level']

class DriversMonthlySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = DriversMonthly
        fields = [
            "id",
            "department",
            "department_name",
            "month",
            "totalNet",
            "enrolled_FTE_dept",
            "activeProg_lab_dept",
            "programLaunches_dept",
            "capexBudget",
            "approvalLeadTimeDays",
            "govFundShare",
            "mopBankTransferPct",
        ]

class MacroMonthlySerializer(serializers.ModelSerializer):
    class Meta:
        model = MacroMonthly
        fields = [
            "month", "fxRate_PHP_USD", "inflationPct", "wageIndex",
            "source", "release_version"
        ]

class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        fields = [
            "id", "scenarioCode", "scenarioName", "horizonMonths",
            "assumptions", "isActive", "createdAt"
        ]

class ScenarioDeptFactorSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    scenario_code = serializers.CharField(source="scenario.scenarioCode", read_only=True)

    class Meta:
        model = ScenarioDeptFactor
        fields = ["id", "scenario", "scenario_code", "department", "department_name", "pct"]

class ScenarioTxnFactorSerializer(serializers.ModelSerializer):
    transaction_name = serializers.CharField(source="transactionType.name", read_only=True)
    scenario_code = serializers.CharField(source="scenario.scenarioCode", read_only=True)

    class Meta:
        model = ScenarioTxnFactor
        fields = ["id", "scenario", "scenario_code", "transactionType", "transaction_name", "pct"]
