from django.urls import path
from . import views

urlpatterns = [
    path('notes/', views.NoteListCreateView.as_view(), name='note-list-create'),
    path('notes/delete/<int:pk>/', views.NoteDelete.as_view(), name='note-delete'),
    path('rsfp/', views.RequestForPaymentListCreateView.as_view(), name='rfp-list-create'),
    path('departments/', views.DepartmentListCreateView.as_view(), name='department-list-create'),
    path('source-of-funds/', views.SourceOfFundListCreateView.as_view(), name='source-of-fund-list-create'),
    path('transaction-types/', views.TransactionTypeListCreateView.as_view(), name='transaction-type-list-create'),
    path('types-of-business/', views.TypeOfBusinessListCreateView.as_view(), name='type-of-business-list-create'),
    path('modes-of-payment/', views.ModeOfPaymentListCreateView.as_view(), name='mode-of-payment-list-create'),
    path('tax-registrations/', views.TaxRegistrationListCreateView.as_view(), name='tax-registration-list-create'),
]