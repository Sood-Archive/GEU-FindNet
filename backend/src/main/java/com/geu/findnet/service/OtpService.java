package com.geu.findnet.service;

import com.geu.findnet.entity.User;
import com.geu.findnet.repository.UserRepository;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_EXPIRY_MINUTES = 10;

    @Autowired
    private UserRepository userRepository;

    @Value("${spring.sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${app.otp.console-mode:false}")
    private boolean consoleModeEnabled;

    /** Generates a 6-digit OTP, persists it, and emails it to the user's personal email. */
    public void generateAndSendOtp(User user) {
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);
        // Send to college email for verification
        sendOtpEmail(user.getCollegeEmail(), otp);
    }

    /** Returns true and marks user verified if OTP matches and hasn't expired. */
    public boolean verifyOtp(User user, String inputOtp) {
        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            return false;
        }
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return false;
        }
        if (!user.getOtp().equals(inputOtp)) {
            return false;
        }
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        return true;
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private void sendOtpEmail(String toEmail, String otp) {
        if (consoleModeEnabled) {
            log.info("==============================================");
            log.info("  [DEV MODE] OTP for {}: {}", toEmail, otp);
            log.info("==============================================");
            return;
        }
        try {
            Email from = new Email("shivankgarg664@gmail.com", "GEU FindNet");
            Email to = new Email(toEmail);
            String subject = "GEU FindNet – Email Verification OTP";
            Content content = new Content("text/plain",
                "Hello,\n\n" +
                "Your OTP for email verification is: " + otp + "\n\n" +
                "This OTP is valid for " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "– GEU FindNet Team"
            );
            Mail mail = new Mail(from, subject, to, content);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("OTP email sent to {} (status {})", toEmail, response.getStatusCode());
            } else {
                log.error("SendGrid rejected email to {}: {} - {}", toEmail, response.getStatusCode(), response.getBody());
                logFallbackOtp(toEmail, otp);
            }
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            logFallbackOtp(toEmail, otp);
        }
    }

    private void logFallbackOtp(String toEmail, String otp) {
        log.warn("==============================================");
        log.warn("  [FALLBACK] OTP for {}: {}", toEmail, otp);
        log.warn("==============================================");
    }
}
