import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, CheckCircle, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccountVerify() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingPhone, setSendingPhone] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);

  const handleSendEmailCode = async () => {
    setSendingEmail(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/verification/send-email-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        setEmailSent(true);
      } else {
        alert(data.error || data.message || 'Failed to send code');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending code');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendPhoneCode = async () => {
    setSendingPhone(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/verification/send-phone-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        setPhoneSent(true);
      } else {
        alert(data.error || data.message || 'Failed to send code');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending code');
    } finally {
      setSendingPhone(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifyingEmail(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/verification/verify-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: emailCode }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Email verified successfully!');
        window.location.reload(); // Refresh to update verification status
      } else {
        alert(data.error || data.message || 'Verification failed');
      }
    } catch (err: any) {
      alert(err.message || 'Verification error');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleVerifyPhone = async () => {
    setVerifyingPhone(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/verification/verify-phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: phoneCode }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Phone verified successfully!');
        window.location.reload(); // Refresh to update verification status
      } else {
        alert(data.error || data.message || 'Verification failed');
      }
    } catch (err: any) {
      alert(err.message || 'Verification error');
    } finally {
      setVerifyingPhone(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Verify Your Account</h1>
          <p className="text-stone-600">Complete verification to unlock all platform features</p>
        </div>

        <div className="space-y-6">
          {/* Email Verification */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                user?.emailVerified ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                {user?.emailVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Mail className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">Email Verification</h3>
                <p className="text-sm text-stone-600 mb-4">{user?.email}</p>
                
                {user?.emailVerified ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!emailSent ? (
                      <button
                        onClick={handleSendEmailCode}
                        disabled={sendingEmail}
                        className="btn-primary"
                      >
                        {sendingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Verification Code
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-green-600">Verification code sent to {user?.email}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value)}
                            className="input-field flex-1"
                            maxLength={6}
                          />
                          <button
                            onClick={handleVerifyEmail}
                            disabled={verifyingEmail || emailCode.length !== 6}
                            className="btn-primary"
                          >
                            {verifyingEmail ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Verify'
                            )}
                          </button>
                        </div>
                        <button
                          onClick={handleSendEmailCode}
                          className="text-sm text-brand-600 hover:text-brand-700"
                        >
                          Resend code
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phone Verification */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                user?.phoneVerified ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                {user?.phoneVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Phone className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">Phone Verification</h3>
                <p className="text-sm text-stone-600 mb-4">{user?.phoneNumber || 'No phone number on file'}</p>
                
                {user?.phoneVerified ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                ) : !user?.phoneNumber ? (
                  <button
                    onClick={() => navigate('/profile')}
                    className="btn-secondary"
                  >
                    Add Phone Number
                  </button>
                ) : (
                  <div className="space-y-3">
                    {!phoneSent ? (
                      <button
                        onClick={handleSendPhoneCode}
                        disabled={sendingPhone}
                        className="btn-primary"
                      >
                        {sendingPhone ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send SMS Code
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-green-600">Verification code sent to {user?.phoneNumber}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value)}
                            className="input-field flex-1"
                            maxLength={6}
                          />
                          <button
                            onClick={handleVerifyPhone}
                            disabled={verifyingPhone || phoneCode.length !== 6}
                            className="btn-primary"
                          >
                            {verifyingPhone ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Verify'
                            )}
                          </button>
                        </div>
                        <button
                          onClick={handleSendPhoneCode}
                          className="text-sm text-brand-600 hover:text-brand-700"
                        >
                          Resend code
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
