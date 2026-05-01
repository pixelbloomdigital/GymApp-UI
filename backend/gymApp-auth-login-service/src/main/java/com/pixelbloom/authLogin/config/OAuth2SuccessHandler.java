package com.pixelbloom.authLogin.config;

import com.pixelbloom.authLogin.entity.Member;
import com.pixelbloom.authLogin.entity.Visitor;
import com.pixelbloom.authLogin.enums.AuthProviderType;
import com.pixelbloom.authLogin.enums.MemberStatus;
import com.pixelbloom.authLogin.enums.Role;
import com.pixelbloom.authLogin.jwt.JwtService;
import com.pixelbloom.authLogin.repository.MemberRepository;
import com.pixelbloom.authLogin.repository.VisitorRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final VisitorRepository visitorRepository;
    private final MemberRepository  memberRepository;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String googleSub = oAuth2User.getAttribute("sub");
        String email     = oAuth2User.getAttribute("email");
        String name      = oAuth2User.getAttribute("name");
        String picture   = oAuth2User.getAttribute("picture");

        // Check if account already existed before this request
        boolean alreadyExisted = memberRepository.findByEmail(email).isPresent();

        // Always find-or-create in BOTH tables
        // 1. Visitor table (for demo booking)
        Visitor visitor = visitorRepository.findByProviderId(googleSub)
                .or(() -> visitorRepository.findByEmail(email))
                .orElseGet(() -> {
                    Visitor v = new Visitor();
                    v.setProviderId(googleSub);
                    v.setProviderType(AuthProviderType.GOOGLE);
                    v.setEmail(email);
                    v.setName(name);
                    v.setProfilePictureUrl(picture);
                    v.setRole(Role.VISITOR);
                    return visitorRepository.save(v);
                });

        // Link providerId if missing
        if (visitor.getProviderId() == null) {
            visitor.setProviderId(googleSub);
            visitor.setProviderType(AuthProviderType.GOOGLE);
            visitor.setProfilePictureUrl(picture);
            visitorRepository.save(visitor);
        }

        // 2. Member table (for login)
        Member member = memberRepository.findByEmail(email)
                .orElseGet(() -> {
                    Member m = new Member();
                    m.setName(name);
                    m.setEmail(email);
                    m.setProviderId(googleSub);
                    m.setProviderType(AuthProviderType.GOOGLE);
                    m.setRole(Role.VISITOR);
                    m.setMemberStatus(MemberStatus.INACTIVE);
                    return memberRepository.save(m);
                });

        String token = jwtService.generateToken(
                member.getMemberId(), member.getEmail(), member.getRole().name());

        log.info("OAuth2 success: email={} role={} isNew={}", email, member.getRole(), !alreadyExisted);

        // Pass isNew flag so frontend knows whether to show "registered" or "logged in"
        String queryParams = "?token="     + token
                + "&visitorId=" + visitor.getVisitorId()
                + "&id="        + member.getMemberId()
                + "&name="      + java.net.URLEncoder.encode(name, "UTF-8")
                + "&email="     + java.net.URLEncoder.encode(email, "UTF-8")
                + "&role="      + member.getRole().name()
                + "&isNew="     + !alreadyExisted;

        response.sendRedirect("http://localhost:5173/oauth2/callback" + queryParams);
    }
}
