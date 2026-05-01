package com.pixelbloom.authLogin.config;

import com.pixelbloom.authLogin.enums.PermissionType;
import com.pixelbloom.authLogin.enums.Role;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static com.pixelbloom.authLogin.enums.PermissionType.*;

/**
 * Defines which fine-grained permissions each Role carries.
 * Used by JwtAuthenticationFilter to populate the SecurityContext
 * with both the ROLE_ authority and individual permission authorities.
 */
public class RolePermissionMapping {

    private static final Map<Role, Set<PermissionType>> ROLE_PERMISSIONS = Map.of(

            Role.VISITOR, Set.of(
                    MEMBERSHIP_READ,
                    BATCH_READ,
                    DIET_PLAN_READ,
                    EVENT_READ,
                    COSTUME_READ,
                    COSTUME_BOOK,
                    ANNOUNCEMENT_READ
            ),

            Role.MEMBER, Set.of(
                    MEMBER_READ,
                    MEMBERSHIP_READ,
                    DIET_PLAN_READ,
                    ATTENDANCE_READ,
                    BATCH_READ,
                    ANNOUNCEMENT_READ,
                    EVENT_READ,
                    COSTUME_READ,
                    COSTUME_BOOK,
                    DASHBOARD_VIEW
            ),

            Role.TRAINER, Set.of(
                    MEMBER_READ,
                    MEMBERSHIP_READ,
                    ATTENDANCE_READ,
                    ATTENDANCE_WRITE,
                    BATCH_READ,
                    DIET_PLAN_READ,
                    ANNOUNCEMENT_READ,
                    PAYROLL_READ,
                    DASHBOARD_VIEW
            ),

            Role.ADMIN, Set.of(
                    VISITOR_READ,
                    VISITOR_WRITE,
                    MEMBER_READ,
                    MEMBER_WRITE,
                    MEMBERSHIP_READ,
                    MEMBERSHIP_WRITE,
                    MEMBERSHIP_DELETE,
                    DIET_PLAN_READ,
                    DIET_PLAN_WRITE,
                    ATTENDANCE_READ,
                    ATTENDANCE_WRITE,
                    BATCH_READ,
                    BATCH_WRITE,
                    TRAINER_READ,
                    TRAINER_WRITE,
                    PAYROLL_READ,
                    PAYROLL_WRITE,
                    EQUIPMENT_READ,
                    EQUIPMENT_WRITE,
                    EXPENSE_READ,
                    EXPENSE_WRITE,
                    REPORT_VIEW,
                    DASHBOARD_VIEW,
                    ANNOUNCEMENT_READ,
                    ANNOUNCEMENT_WRITE,
                    EVENT_READ,
                    EVENT_WRITE,
                    COSTUME_READ,
                    COSTUME_BOOK,
                    USER_MANAGE
            )
    );

    /**
     * Returns a set of {@link SimpleGrantedAuthority} for the given role,
     * based on the permission strings defined in {@link PermissionType}.
     */
    public static Set<SimpleGrantedAuthority> getAuthoritiesForRole(Role role) {
        Set<PermissionType> permissions = ROLE_PERMISSIONS.getOrDefault(role, Set.of());
        return permissions.stream()
                .map(p -> new SimpleGrantedAuthority(p.getPermission()))
                .collect(Collectors.toSet());
    }
}
