package com.mediflow.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediflow.dto.*;
import com.mediflow.entity.*;
import com.mediflow.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class MediFlowFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.mediflow.service.UserService userService;

    @Autowired
    private com.mediflow.service.GoogleTokenVerifierService googleTokenVerifierService;

    @BeforeEach
    public void setup() {
        notificationRepository.deleteAll();
        prescriptionRepository.deleteAll();
        medicalRecordRepository.deleteAll();
        appointmentRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();
        userRepository.deleteAll();
        hospitalRepository.deleteAll();

        // Create platform admin
        User adminUser = new User();
        adminUser.setUsername("platformadmin");
        adminUser.setPassword(passwordEncoder.encode("adminpassword"));
        adminUser.setEmail("admin@mediflow.com");
        adminUser.setRole(Role.PLATFORM_ADMIN);
        adminUser.setFirstName("Platform");
        adminUser.setLastName("Admin");
        adminUser.setAvatarId("avatar_admin");
        userRepository.save(adminUser);
    }

    @Test
    public void testFullMediFlowIntegration() throws Exception {
        // ==========================================
        // 1. Hospital Registration
        // ==========================================
        RegisterRequest hospitalRequest = new RegisterRequest();
        hospitalRequest.setUsername("apolloadmin");
        hospitalRequest.setPassword("hosp12345");
        hospitalRequest.setEmail("admin@apollo.com");
        hospitalRequest.setRole(Role.HOSPITAL_ADMIN);
        hospitalRequest.setFirstName("Apollo");
        hospitalRequest.setLastName("Admin");
        hospitalRequest.setHospitalName("Apollo Hospital");
        hospitalRequest.setHospitalEmail("contact@apollo.com");
        hospitalRequest.setHospitalPhone("0791234567");
        hospitalRequest.setHospitalAddress("Sarkhej - Gandhinagar Hwy");
        hospitalRequest.setHospitalCity("Ahmedabad");
        hospitalRequest.setHospitalState("Gujarat");
        hospitalRequest.setHospitalPincode("380054");
        hospitalRequest.setHospitalLatitude(23.075);
        hospitalRequest.setHospitalLongitude(72.508);
        hospitalRequest.setHospitalLicenseNumber("HOSP-APOLLO-789");
        hospitalRequest.setHospitalDescription("Multi-specialty hospital");
        hospitalRequest.setHospitalLogoAvatar("hospital_logo_apollo");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hospitalRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("apolloadmin")))
                .andExpect(jsonPath("$.role", is("HOSPITAL_ADMIN")));

        // ==========================================
        // 2. Hospital Login
        // ==========================================
        LoginRequest hospitalLogin = new LoginRequest();
        hospitalLogin.setUsername("apolloadmin");
        hospitalLogin.setPassword("hosp12345");

        MvcResult hospitalLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hospitalLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.firstName", is("Apollo Hospital"))) // Overridden name
                .andExpect(jsonPath("$.lastName", is("")))
                .andExpect(jsonPath("$.avatarId", is("hospital_logo_apollo")))
                .andReturn();

        String hospitalToken = objectMapper.readTree(hospitalLoginResult.getResponse().getContentAsString()).get("token").asText();
        Long hospitalId = objectMapper.readTree(hospitalLoginResult.getResponse().getContentAsString()).get("profileId").asLong();

        // ==========================================
        // 3. Hospital Profile Update
        // ==========================================
        HospitalDto hospitalUpdate = new HospitalDto();
        hospitalUpdate.setId(hospitalId);
        hospitalUpdate.setName("Apollo Super Speciality Hospital");
        hospitalUpdate.setEmail("contact@apollosuperspec.com");
        hospitalUpdate.setPhone("0799876543");
        hospitalUpdate.setAddress("Sarkhej - Gandhinagar Hwy, Ahmedabad");
        hospitalUpdate.setCity("Ahmedabad");
        hospitalUpdate.setState("Gujarat");
        hospitalUpdate.setPincode("380054");
        hospitalUpdate.setLatitude(23.075);
        hospitalUpdate.setLongitude(72.508);
        hospitalUpdate.setLicenseNumber("HOSP-APOLLO-789");
        hospitalUpdate.setDescription("Apollo Super Specialty Hospital");
        hospitalUpdate.setLogoAvatar("hospital_logo_apollo_spec");

        mockMvc.perform(put("/api/hospitals/my-hospital")
                .header("Authorization", "Bearer " + hospitalToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hospitalUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Apollo Super Speciality Hospital")))
                .andExpect(jsonPath("$.logoAvatar", is("hospital_logo_apollo_spec")));

        // ==========================================
        // 4. Doctor Registration
        // ==========================================
        RegisterRequest doctorRequest = new RegisterRequest();
        doctorRequest.setUsername("johnsmith");
        doctorRequest.setPassword("docpassword");
        doctorRequest.setEmail("johnsmith@apollo.com");
        doctorRequest.setRole(Role.DOCTOR);
        doctorRequest.setFirstName("John");
        doctorRequest.setLastName("Smith");
        doctorRequest.setSpecialization("Cardiology");
        doctorRequest.setLicenseNumber("LIC-MED-12345");
        doctorRequest.setConsultationFee(BigDecimal.valueOf(150.00));
        doctorRequest.setBio("Experienced cardiologist");
        doctorRequest.setHospitalId(hospitalId);
        doctorRequest.setQualification("MBBS, MD");
        doctorRequest.setExperience(12);
        doctorRequest.setPhone("0998877665");
        doctorRequest.setLanguages("English, Spanish");
        doctorRequest.setAvatarId("doctor_avatar_john");

        MvcResult doctorRegResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(doctorRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("johnsmith")))
                .andReturn();

        // Get Doctor ID from DB directly
        Doctor doctorEntity = doctorRepository.findAll().get(0);
        Long doctorId = doctorEntity.getId();

        // ==========================================
        // 5. Doctor Approval
        // ==========================================
        mockMvc.perform(put("/api/hospitals/my-hospital/doctors/" + doctorId + "/status?status=APPROVED")
                .header("Authorization", "Bearer " + hospitalToken))
                .andExpect(status().isOk());

        // ==========================================
        // 6. Doctor Login
        // ==========================================
        LoginRequest doctorLogin = new LoginRequest();
        doctorLogin.setUsername("johnsmith");
        doctorLogin.setPassword("docpassword");

        MvcResult doctorLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(doctorLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.firstName", is("John")))
                .andExpect(jsonPath("$.lastName", is("Smith")))
                .andReturn();

        String doctorToken = objectMapper.readTree(doctorLoginResult.getResponse().getContentAsString()).get("token").asText();

        // ==========================================
        // 7. Patient Registration
        // ==========================================
        RegisterRequest patientRequest = new RegisterRequest();
        patientRequest.setUsername("darshyadav");
        patientRequest.setPassword("patient123");
        patientRequest.setEmail("darsh@yadav.com");
        patientRequest.setRole(Role.PATIENT);
        patientRequest.setFirstName("Darsh");
        patientRequest.setLastName("Yadav");
        patientRequest.setDateOfBirth(LocalDate.of(1995, 8, 15));
        patientRequest.setGender("Male");
        patientRequest.setPhone("0987654321");
        patientRequest.setAddress("Drive-In Rd, Ahmedabad");
        patientRequest.setEmergencyContact("9898989898");
        patientRequest.setBloodType("O+");
        patientRequest.setAvatarId("avatar_darsh");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patientRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("darshyadav")));

        // ==========================================
        // 8. Patient Login
        // ==========================================
        LoginRequest patientLogin = new LoginRequest();
        patientLogin.setUsername("darshyadav");
        patientLogin.setPassword("patient123");

        MvcResult patientLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patientLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.firstName", is("Darsh")))
                .andExpect(jsonPath("$.lastName", is("Yadav")))
                .andReturn();

        String patientToken = objectMapper.readTree(patientLoginResult.getResponse().getContentAsString()).get("token").asText();
        Long patientProfileId = objectMapper.readTree(patientLoginResult.getResponse().getContentAsString()).get("profileId").asLong();

        // ==========================================
        // 9. Patient Profile Update
        // ==========================================
        PatientDto patientUpdate = new PatientDto();
        patientUpdate.setId(patientProfileId);
        patientUpdate.setDateOfBirth(LocalDate.of(1995, 8, 15));
        patientUpdate.setGender("Male");
        patientUpdate.setPhone("0987654321");
        patientUpdate.setAddress("Drive-In Road, Ahmedabad, Gujarat");
        patientUpdate.setEmergencyContact("9898989898");
        patientUpdate.setBloodType("AB+");
        patientUpdate.setUser(new UserDto(null, "darshyadav", "darsh@yadav.com", Role.PATIENT, "Darsh Kumar", "Yadav", "avatar_darsh_updated", null));

        mockMvc.perform(put("/api/patients/" + patientProfileId)
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patientUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bloodType", is("AB+")))
                .andExpect(jsonPath("$.user.firstName", is("Darsh Kumar")))
                .andExpect(jsonPath("$.user.avatarId", is("avatar_darsh_updated")));

        // ==========================================
        // 10. Hospital Search & City Search
        // ==========================================
        mockMvc.perform(get("/api/hospitals/search?city=Ahmedabad"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name", containsString("Apollo")));

        mockMvc.perform(get("/api/hospitals/search?city= ahmedabad ")) // Trim/lowercase test
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // ==========================================
        // 11. Doctor Search
        // ==========================================
        mockMvc.perform(get("/api/doctors/search?city=Ahmedabad"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].user.firstName", is("John")));

        mockMvc.perform(get("/api/doctors/search?city= ahmedabad "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // ==========================================
        // 12. Approved Doctors By Hospital (Issue 1 endpoint)
        // ==========================================
        mockMvc.perform(get("/api/doctors/hospital/" + hospitalId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].id", is(doctorId.intValue())))
                .andExpect(jsonPath("$[0].status", is("APPROVED")));

        mockMvc.perform(get("/api/doctors/hospital/" + hospitalId + "/specializations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0]", is("Cardiology")));

        // ==========================================
        // 13. Appointment Booking
        // ==========================================
        AppointmentRequestDto appointmentRequest = new AppointmentRequestDto();
        appointmentRequest.setPatientId(patientProfileId);
        appointmentRequest.setDoctorId(doctorId);
        appointmentRequest.setAppointmentDate(LocalDateTime.now().plusDays(2));
        appointmentRequest.setReason("Chest tightness");
        appointmentRequest.setNotes("No allergies");

        MvcResult appointmentResult = mockMvc.perform(post("/api/appointments")
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.reason", is("Chest tightness")))
                .andReturn();

        Long appointmentId = objectMapper.readTree(appointmentResult.getResponse().getContentAsString()).get("id").asLong();

        // ==========================================
        // 14. Appointment Approval (by Hospital Admin or Doctor)
        // ==========================================
        mockMvc.perform(put("/api/appointments/" + appointmentId + "/status?status=APPROVED")
                .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")));

        // ==========================================
        // 15. Medical Record Creation & Appointment Completion
        // ==========================================
        MedicalRecordRequestDto recordRequest = new MedicalRecordRequestDto();
        recordRequest.setPatientId(patientProfileId);
        recordRequest.setDoctorId(doctorId);
        recordRequest.setDiagnosis("Mild Angina");
        recordRequest.setPrescription("Aspirin 75mg daily");
        recordRequest.setTreatmentNotes("Rest and follow up in a month");

        mockMvc.perform(post("/api/medical-records")
                .header("Authorization", "Bearer " + doctorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recordRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.diagnosis", is("Mild Angina")));

        // Complete the appointment
        mockMvc.perform(put("/api/appointments/" + appointmentId + "/status?status=COMPLETED&notes=Completed successfully")
                .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")));

        // ==========================================
        // 16. Prescription Creation
        // ==========================================
        PrescriptionRequestDto prescriptionRequest = new PrescriptionRequestDto();
        prescriptionRequest.setPatientId(patientProfileId);
        prescriptionRequest.setDoctorId(doctorId);
        prescriptionRequest.setHospitalId(hospitalId);
        prescriptionRequest.setPrescriptionDate(LocalDate.now());
        prescriptionRequest.setMedicinesJson("[{\"name\":\"Aspirin\",\"dosage\":\"75mg\",\"frequency\":\"Once daily\",\"duration\":\"30 days\",\"instructions\":\"After breakfast\"}]");
        prescriptionRequest.setDosage("Take as directed");
        prescriptionRequest.setInstructions("Do not skip doses");
        prescriptionRequest.setNotes("Avoid heavy exercises");

        MvcResult prescriptionResult = mockMvc.perform(post("/api/prescriptions")
                .header("Authorization", "Bearer " + doctorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(prescriptionRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dosage", is("Take as directed")))
                .andReturn();

        Long prescriptionId = objectMapper.readTree(prescriptionResult.getResponse().getContentAsString()).get("id").asLong();

        // ==========================================
        // 17. Prescription View
        // ==========================================
        mockMvc.perform(get("/api/prescriptions/" + prescriptionId)
                .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dosage", is("Take as directed")))
                .andExpect(jsonPath("$.patient.user.firstName", is("Darsh Kumar")))
                .andExpect(jsonPath("$.doctor.user.firstName", is("John")))
                .andExpect(jsonPath("$.hospital.name", is("Apollo Super Speciality Hospital")));

        // ==========================================
        // 18. Dashboard Stats
        // ==========================================
        mockMvc.perform(get("/api/dashboard/stats")
                .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPrescriptions", is(1)))
                .andExpect(jsonPath("$.totalAppointments", is(1)));

        mockMvc.perform(get("/api/dashboard/stats")
                .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPatients", is(1)))
                .andExpect(jsonPath("$.totalPrescriptions", is(1)));

        mockMvc.perform(get("/api/dashboard/stats")
                .header("Authorization", "Bearer " + hospitalToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDoctors", is(1)))
                .andExpect(jsonPath("$.totalPrescriptions", is(1)));
    }

    @Test
    public void testUserSettingsEndpoints() throws Exception {
        LoginRequest adminLogin = new LoginRequest();
        adminLogin.setUsername("platformadmin");
        adminLogin.setPassword("adminpassword");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        System.out.println("--- TESTING POST /api/users/change-password ---");
        java.util.Map<String, String> pwRequest = java.util.Map.of(
            "currentPassword", "adminpassword",
            "newPassword", "newPassword123!",
            "confirmPassword", "newPassword123!"
        );
        MvcResult pwResult = mockMvc.perform(post("/api/users/change-password")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pwRequest)))
                .andExpect(status().isOk())
                .andReturn();
        System.out.println("Response Status for change-password: " + pwResult.getResponse().getStatus());
        System.out.println("Response Body for change-password: " + pwResult.getResponse().getContentAsString());
    }

    @Test
    public void testGoogleLoginNewUser() throws Exception {
        java.util.Map<String, String> googleRequest = java.util.Map.of(
            "idToken", "mock-google-token"
        );
        mockMvc.perform(post("/api/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(googleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("mockuser@google.com")))
                .andExpect(jsonPath("$.role", is("PATIENT")));
    }

    @Test
    public void testGoogleLoginExistingLocalUser() throws Exception {
        // First register a local user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("localuser");
        registerRequest.setPassword("password123!");
        registerRequest.setEmail("localuser@google.com");
        registerRequest.setRole(Role.PATIENT);
        registerRequest.setFirstName("Local");
        registerRequest.setLastName("User");
        registerRequest.setDateOfBirth(LocalDate.of(1995, 5, 5));
        registerRequest.setGender("Male");
        registerRequest.setPhone("1234567890");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        // Login with Google using same email
        java.util.Map<String, String> googleRequest = java.util.Map.of(
            "idToken", "mock-localuser"
        );
        mockMvc.perform(post("/api/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(googleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("localuser@google.com")));

        // Verify provider in db updated to GOOGLE
        User user = userRepository.findByEmail("localuser@google.com").orElseThrow();
        assertEquals(AuthProvider.GOOGLE, user.getAuthProvider());
    }
}
