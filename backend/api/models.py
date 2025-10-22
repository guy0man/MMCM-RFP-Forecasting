from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import datetime as dt   # ← needed for month_idx logic


# ==============================
# Notes
# ==============================
class Note(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ==============================
# Request for Payment
# ==============================
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
    pr = models.CharField(max_length=100)
    po = models.CharField(max_length=100)
    rr = models.CharField(max_length=100)

    # payee information
    tin = models.CharField(max_length=20)
    payeeAddress = models.TextField()

    # payment details
    currency = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    serviceFee = models.DecimalField(max_digits=9, decimal_places=2)
    lessEWT = models.DecimalField(max_digits=9, decimal_places=2)
    netTotal = models.DecimalField(max_digits=9, decimal_places=2)

    # instructions
    instructions = models.TextField(blank=True, null=True)

    # relationships
    department = models.ForeignKey('Department', on_delete=models.SET_NULL, null=True, related_name='rfps')
    sourceOfFund = models.ForeignKey('SourceOfFund', on_delete=models.SET_NULL, null=True, related_name='rfps')
    transactionType = models.ForeignKey('TransactionType', on_delete=models.SET_NULL, null=True, related_name='rfps')
    typeOfBusiness = models.ForeignKey('TypeOfBusiness', on_delete=models.SET_NULL, null=True, related_name='rfps')
    modeOfPayment = models.ForeignKey('ModeOfPayment', on_delete=models.SET_NULL, null=True, related_name='rfps')
    taxRegistration = models.ForeignKey('TaxRegistration', on_delete=models.SET_NULL, null=True, related_name='rfps')

    def __str__(self):
        return str(self.id)


# ==============================
# Reference / Dimension Tables
# ==============================
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    costCenter = models.CharField(max_length=100)
    programs = models.SmallIntegerField(null=True, blank=True)
    students = models.IntegerField(null=True, blank=True)
    capexBudget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return self.name


class SourceOfFund(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name


class TransactionType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name


class TypeOfBusiness(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name


class ModeOfPayment(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name


class TaxRegistration(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name


# ==============================
# Drivers
# ==============================
class DriversMonthly(models.Model):
    department = models.ForeignKey('Department', on_delete=models.CASCADE, related_name='drivers')
    month = models.DateField()  # normalized to 1st of month
    totalNet = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    macro = models.ForeignKey('MacroMonthly', on_delete=models.CASCADE, related_name='drivers', null=True, blank=True)

    enrolled_FTE_dept = models.IntegerField(null=True, blank=True)
    activeProg_lab_dept = models.PositiveSmallIntegerField(null=True, blank=True)
    programLaunches_dept = models.PositiveSmallIntegerField(null=True, blank=True)
    capexBudget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    approvalLeadTimeDays = models.PositiveIntegerField(null=True, blank=True)
    govFundShare = models.DecimalField(
        max_digits=5, decimal_places=4, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(1)], help_text="0–1 ratio"
    )
    mopBankTransferPct = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="0–100%"
    )

    isEmergency = models.BooleanField(default=False)
    month_idx = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['month']),
            models.Index(fields=['department', 'month']),
            models.Index(fields=['month_idx']),
        ]
        ordering = ['department', 'month']

    def save(self, *args, **kwargs):
        # normalize to first of month and compute month_idx if empty
        if self.month:
            self.month = self.month.replace(day=1)
            if not self.month_idx:
                epoch = dt.date(2015, 1, 1)
                self.month_idx = (self.month.year - epoch.year) * 12 + (self.month.month - epoch.month) + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.department.name} | {self.month:%Y-%m-01}"


# ==============================
# Macro Indicators
# ==============================
class MacroMonthly(models.Model):
    month = models.DateField()
    fxRate_PHP_USD = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    inflationPct = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    wageIndex = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)

    class Meta:
        ordering = ['month']
        indexes = [models.Index(fields=['month'])]

    def __str__(self):
        return f"{self.month:%Y-%m}"


# ==============================
# Forecasting
# ==============================
class ForecastRun(models.Model):
    run_at = models.DateTimeField(auto_now_add=True)
    model_version = models.CharField(max_length=80)
    horizon_months = models.IntegerField()
    scenario = models.ForeignKey('Scenario', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Run #{self.pk} - {self.model_version} ({self.run_at:%Y-%m-%d})"


class ForecastResult(models.Model):
    run = models.ForeignKey('ForecastRun', on_delete=models.CASCADE, related_name='results')
    month = models.DateField()
    department = models.ForeignKey('Department', on_delete=models.CASCADE, related_name='forecast_results', null=True, blank=True)
    transactionType = models.ForeignKey('TransactionType', on_delete=models.CASCADE, related_name='forecast_results', null=True, blank=True)

    p10 = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    p50 = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    p90 = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    mean = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    reconciled = models.BooleanField(default=False)
    level = models.CharField(max_length=40, default="department")

    class Meta:
        indexes = [
            models.Index(fields=['run', 'month']),
            models.Index(fields=['department', 'month']),
        ]
        unique_together = ('run', 'month', 'department', 'transactionType')


# ==============================
# Scenario Management
# ==============================
class Scenario(models.Model):
    scenarioCode = models.CharField(max_length=50, unique=True)
    scenarioName = models.CharField(max_length=255)
    horizonMonths = models.PositiveIntegerField(default=12)
    assumptions = models.JSONField(default=dict)  # {"fxRate_delta": -0.5, "govFundShare_delta": -0.1}
    isActive = models.BooleanField(default=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.scenarioCode


class ScenarioDeptFactor(models.Model):
    scenario = models.ForeignKey('Scenario', on_delete=models.CASCADE, related_name='dept_factors')
    department = models.ForeignKey('Department', on_delete=models.CASCADE)
    pct = models.DecimalField(max_digits=6, decimal_places=2)  # +10 = +10%

    class Meta:
        unique_together = ('scenario', 'department')


class ScenarioTxnFactor(models.Model):
    scenario = models.ForeignKey('Scenario', on_delete=models.CASCADE, related_name='txn_factors')
    transactionType = models.ForeignKey('TransactionType', on_delete=models.CASCADE)
    pct = models.DecimalField(max_digits=6, decimal_places=2)

    class Meta:
        unique_together = ('scenario', 'transactionType')
