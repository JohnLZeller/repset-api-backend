import { useState, FormEvent } from 'react';
import { SettingsCard } from './SettingsCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api, ErrorResponse } from '@/utils/api';

interface FieldErrors {
  current_password?: string[];
  new_password?: string[];
  new_password_confirm?: string[];
  non_field_errors?: string[];
}

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!currentPassword) {
      errors.current_password = ['Current password is required.'];
    }

    if (!newPassword) {
      errors.new_password = ['New password is required.'];
    } else if (newPassword.length < 8) {
      errors.new_password = ['Password must be at least 8 characters.'];
    }

    if (!confirmPassword) {
      errors.new_password_confirm = ['Please confirm your new password.'];
    } else if (newPassword !== confirmPassword) {
      errors.new_password_confirm = ['Passwords do not match.'];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setGeneralError(null);
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
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });

      // Success - clear form and show success message
      clearForm();
      setSuccess(true);
    } catch (err: unknown) {
      const errorData: ErrorResponse = (err as { data?: ErrorResponse })?.data || {};

      // Map backend errors to field errors
      const newFieldErrors: FieldErrors = {};

      if (errorData.current_password) {
        newFieldErrors.current_password = Array.isArray(errorData.current_password)
          ? errorData.current_password
          : [errorData.current_password];
      }

      if (errorData.new_password) {
        newFieldErrors.new_password = Array.isArray(errorData.new_password)
          ? errorData.new_password
          : [errorData.new_password];
      }

      if (errorData.new_password_confirm) {
        newFieldErrors.new_password_confirm = Array.isArray(errorData.new_password_confirm)
          ? errorData.new_password_confirm
          : [errorData.new_password_confirm];
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
      <SettingsCard>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Success message */}
            {success && (
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm text-center">
                Password updated successfully.
              </div>
            )}

            {/* General error message */}
            {(generalError || fieldErrors.non_field_errors) && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {generalError || fieldErrors.non_field_errors?.join(' ')}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (fieldErrors.current_password) {
                    setFieldErrors((prev) => ({ ...prev, current_password: undefined }));
                  }
                }}
                autoComplete="current-password"
                aria-invalid={!!fieldErrors.current_password}
                aria-describedby={fieldErrors.current_password ? 'currentPassword-error' : undefined}
              />
              {fieldErrors.current_password && (
                <p id="currentPassword-error" className="text-sm text-destructive">
                  {fieldErrors.current_password.join(' ')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.new_password) {
                    setFieldErrors((prev) => ({ ...prev, new_password: undefined }));
                  }
                }}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.new_password}
                aria-describedby={fieldErrors.new_password ? 'newPassword-error' : undefined}
              />
              {fieldErrors.new_password && (
                <p id="newPassword-error" className="text-sm text-destructive">
                  {fieldErrors.new_password.join(' ')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.new_password_confirm) {
                    setFieldErrors((prev) => ({ ...prev, new_password_confirm: undefined }));
                  }
                }}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.new_password_confirm}
                aria-describedby={fieldErrors.new_password_confirm ? 'confirmPassword-error' : undefined}
              />
              {fieldErrors.new_password_confirm && (
                <p id="confirmPassword-error" className="text-sm text-destructive">
                  {fieldErrors.new_password_confirm.join(' ')}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </SettingsCard>
    </div>
  );
}
