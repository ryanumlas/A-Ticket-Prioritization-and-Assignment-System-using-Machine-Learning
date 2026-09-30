from django.test import TestCase
from rest_framework.test import APIClient

from departments.models import EmployeeDepartment, ITDepartment, OfficeLocation
from users.models import (
	ITSupportProfile,
	ITSupportSpecialization,
	Specializations,
	User,
	UserProfile,
	UserRoles,
)


class AdminUserUpdateTests(TestCase):
	def setUp(self):
		self.admin_role = UserRoles.objects.create(
			name="System Administrator"
		)
		self.employee_role = UserRoles.objects.create(name="Employee")
		self.support_role = UserRoles.objects.create(
			name="IT Support Specialist"
		)
		self.admin = User.objects.create_user(
			username="admin-user",
			password="AdminPass123!",
			role=self.admin_role,
		)
		self.client = APIClient()
		self.client.force_authenticate(user=self.admin)
		self.office = OfficeLocation.objects.create(name="Main Office")
		self.employee_department = EmployeeDepartment.objects.create(
			name="Operations"
		)
		self.it_department = ITDepartment.objects.create(
			name="Hardware Support"
		)
		self.target = User.objects.create_user(
			username="target-user",
			password="OriginalPass123!",
			first_name="Taylor",
			last_name="User",
			email="taylor@example.com",
			role=self.employee_role,
			user_code="EMP-9001",
		)
		UserProfile.objects.create(
			user=self.target,
			employee_department=self.employee_department,
			office_location=self.office,
		)

	def test_updates_employee_details_without_changing_identity_or_password(self):
		response = self.client.patch(
			f"/api/users/admin/{self.target.id}/update/",
			{
				"first_name": "Taylor-Ann",
				"last_name": "User",
				"email": "taylor.ann@example.com",
				"role": self.employee_role.id,
				"employee_department": self.employee_department.id,
				"it_department": None,
				"office_location": self.office.id,
				"specializations": [],
			},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		self.target.refresh_from_db()
		self.assertEqual(self.target.first_name, "Taylor-Ann")
		self.assertEqual(self.target.user_code, "EMP-9001")
		self.assertTrue(self.target.check_password("OriginalPass123!"))

	def test_role_change_creates_support_profile_and_specializations(self):
		specialization = Specializations.objects.create(
			name="Hardware Diagnostics"
		)

		response = self.client.patch(
			f"/api/users/admin/{self.target.id}/update/",
			{
				"first_name": "Taylor",
				"last_name": "User",
				"email": "taylor@example.com",
				"role": self.support_role.id,
				"employee_department": None,
				"it_department": self.it_department.id,
				"office_location": self.office.id,
				"specializations": [specialization.id],
			},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		self.target.refresh_from_db()
		self.assertEqual(self.target.role, self.support_role)
		self.assertIsNone(self.target.profile.employee_department)
		support_profile = ITSupportProfile.objects.get(user=self.target)
		self.assertEqual(support_profile.it_department, self.it_department)
		self.assertTrue(
			ITSupportSpecialization.objects.filter(
				it_support_profile=support_profile,
				specialization=specialization,
			).exists()
		)

	def test_non_admin_cannot_update_users(self):
		self.client.force_authenticate(user=self.target)

		response = self.client.patch(
			f"/api/users/admin/{self.target.id}/update/",
			{"first_name": "Changed"},
			format="json",
		)

		self.assertEqual(response.status_code, 403)
