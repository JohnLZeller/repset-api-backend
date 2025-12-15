import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsCard } from './SettingsCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api, ErrorResponse } from '@/utils/api';

interface FieldErrors {
  email?: string[];
  full_name?: string[];
  non_field_errors?: string[];
}

export default function AccountSettings() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!email) {
      errors.email = ['Email is required.'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ['Please enter a valid email address.'];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setGeneralError(null);

    // Run client-side validation first
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.updateProfile({
        email: email.trim(),
        full_name: fullName.trim(),
      });

      // Refresh user data in context
      await refreshUser();

      // Success - show success message
      setSuccess(true);
      setFieldErrors({});
    } catch (err: unknown) {
      const errorData: ErrorResponse = (err as { data?: ErrorResponse })?.data || {};

      // Map backend errors to field errors
      const newFieldErrors: FieldErrors = {};

      if (errorData.email) {
        newFieldErrors.email = Array.isArray(errorData.email)
          ? errorData.email
          : [errorData.email];
      }

      if (errorData.full_name) {
        newFieldErrors.full_name = Array.isArray(errorData.full_name)
          ? errorData.full_name
          : [errorData.full_name];
      }

      if (errorData.non_field_errors) {
        newFieldErrors.non_field_errors = Array.isArray(errorData.non_field_errors)
          ? errorData.non_field_errors
          : [errorData.non_field_errors];
      }

      setFieldErrors(newFieldErrors);

      // Set general error for network/unexpected errors
      if (Object.keys(newFieldErrors).length === 0) {
        setGeneralError(
          errorData.error ||
          errorData.detail?.toString() ||
          'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">Account Settings</h2>

      <SettingsCard title="Profile Information">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Success message */}
            {success && (
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm text-center">
                Profile updated successfully.
              </div>
            )}

            {/* General error message */}
            {(generalError || fieldErrors.non_field_errors) && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {generalError || fieldErrors.non_field_errors?.join(' ')}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.full_name) {
                    setFieldErrors((prev) => ({ ...prev, full_name: undefined }));
                  }
                }}
                placeholder="Enter your full name"
                autoComplete="name"
                aria-invalid={!!fieldErrors.full_name}
                aria-describedby={fieldErrors.full_name ? 'fullName-error' : undefined}
              />
              {fieldErrors.full_name && (
                <p id="fullName-error" className="text-sm text-destructive">
                  {fieldErrors.full_name.join(' ')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {fieldErrors.email.join(' ')}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </SettingsCard>
    </div>
  );
}
