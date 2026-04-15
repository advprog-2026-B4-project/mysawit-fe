"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth";
import type { UserRole } from "@/modules/auth";
import { getRole } from "@/lib/api/tokenStorage";

type UnauthorizedMode = "redirect" | "logout";

interface RoleGuardProps {
	children: React.ReactNode;
	allowedRoles: UserRole[];
	unauthenticatedRedirectTo?: string;
	unauthorizedRedirectTo?: string;
	unauthorizedMode?: UnauthorizedMode;
}

export default function RoleGuard({
	children,
	allowedRoles,
	unauthenticatedRedirectTo = "/login",
	unauthorizedRedirectTo = "/",
	unauthorizedMode = "redirect",
}: RoleGuardProps) {
	const { isAuthenticated, logout } = useAuth();
	const router = useRouter();
	const redirectHandledRef = useRef(false);

	const roleSet = useMemo(() => new Set<string>(allowedRoles), [allowedRoles]);
	const authenticated = isAuthenticated();
	const currentRole = getRole();
	const isAuthorized = authenticated && !!currentRole && roleSet.has(currentRole);

	useEffect(() => {
		if (isAuthorized) {
			redirectHandledRef.current = false;
			return;
		}

		if (redirectHandledRef.current) {
			return;
		}
		redirectHandledRef.current = true;

		if (!authenticated) {
			if (unauthorizedMode === "logout") {
				logout();
			} else {
				router.push(unauthenticatedRedirectTo);
			}
			return;
		}

		if (unauthorizedMode === "logout") {
			logout();
		} else {
			router.push(unauthorizedRedirectTo);
		}
	}, [
		authenticated,
		isAuthorized,
		logout,
		router,
		unauthenticatedRedirectTo,
		unauthorizedMode,
		unauthorizedRedirectTo,
	]);

	if (!isAuthorized) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-cream">
				<span className="font-sans text-sm text-text-light tracking-widest uppercase animate-pulse">
					Memverifikasi...
				</span>
			</div>
		);
	}

	return <>{children}</>;
}
