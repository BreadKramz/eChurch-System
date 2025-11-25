// Admin authentication and code verification
// Flows:
// 1) Admin enters email/password -> we sign in via Supabase
// 2) If profile.user_role === 'admin', call RPC generate_admin_code() to get a server-generated 6-digit code
// 3) Admin enters the 6-digit code -> we call RPC verify_admin_code(p_code)
// 4) On success, redirect to admin dashboard

(function () {
  // Utilities
  function byId(id) {
    return document.getElementById(id);
  }

  function showFeedback(message, type = 'error') {
    const el = byId('admin-form-feedback');
    if (!el) return;
    el.textContent = message;
    el.className = `mt-3 text-xs text-center p-3 rounded-lg border ${
      type === 'success'
        ? 'text-green-700 bg-green-50 border-green-200'
        : 'text-red-700 bg-red-50 border-red-200'
    }`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 6000);
  }

  // Modal popup for admin messages
  function showAdminPopup(message) {
    try {
      const existing = document.getElementById('admin-popup');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'admin-popup';
      overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      overlay.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0 mr-3">
              <i class="fas fa-info-circle text-primary text-2xl"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-secondary">Information</h3>
            </div>
          </div>
          <p class="text-gray-700 mb-6">${message}</p>
          <div class="text-right">
            <button class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors" id="admin-popup-ok">
              OK
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const okBtn = document.getElementById('admin-popup-ok');
      if (okBtn) {
        okBtn.addEventListener('click', function () {
          const popup = document.getElementById('admin-popup');
          if (popup) popup.remove();
        });
      }
    } catch (e) {
      console.warn('Failed to show admin popup', e);
    }
  }

  function setBtnLoading(btn, loadingText) {
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin text-xs"></i> ${loadingText}`;
  }

  function resetBtn(btn, html) {
    if (!btn) return;
    btn.disabled = false;
    btn.innerHTML = html;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
  }

  // Ensure Supabase is loaded
  if (typeof window.supabaseClient === 'undefined') {
    console.error('Supabase client not found. Ensure /src/assets/js/supabase.js is loaded before this script.');
    return;
  }

  // DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    const authForm = byId('admin-auth-form');
    const codeForm = byId('admin-code-form');
    const getCodeBtn = byId('admin-get-code-btn');
    const verifyBtn = byId('admin-verify-btn');
    const togglePwd = byId('toggle-admin-password');

    // Step toggling: code form disabled until we complete step 1
    function enableCodeStep() {
      if (!codeForm) return;
      codeForm.querySelectorAll('input,button').forEach(el => (el.disabled = false));
    }
    function disableCodeStep() {
      if (!codeForm) return;
      codeForm.querySelectorAll('input,button').forEach(el => (el.disabled = true));
    }
    disableCodeStep();

    // Password visibility toggle
    if (togglePwd) {
      togglePwd.addEventListener('click', function () {
        const input = byId('admin-password');
        if (!input) return;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
      });
    }

    // Step 1: sign in + request server code
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = (byId('admin-email')?.value || '').trim();
        const password = byId('admin-password')?.value || '';

        if (!isValidEmail(email)) {
          showFeedback('Please enter a valid admin email address.', 'error');
          return;
        }
        if (!password) {
          showFeedback('Please enter your password.', 'error');
          return;
        }

        setBtnLoading(getCodeBtn, 'Signing In...');
        try {
          // Sign in using existing auth helper for consistency
          const result = await window.churchAuth.signIn(email, password, false);
          if (!result?.success) {
            showFeedback(result?.error || 'Invalid credentials.', 'error');
            resetBtn(getCodeBtn, '<i class="fas fa-key text-xs"></i> <span>Sign In & Get Admin Code</span>');
            return;
          }

          // Ensure profile role is admin
          const currentUser = window.churchAuth.getCurrentUser();
          const isKnownAdmin = currentUser?.email?.toLowerCase() === 'admin@ompchurchdumaguete.com';

          let profile = await window.churchAuth.getUserProfile();
          console.log('Admin login - profile:', profile);

          // If profile doesn't exist for known admin, try to create it
          if (!profile && isKnownAdmin) {
            console.log('Creating admin profile for known admin user...');
            try {
              const { error: createError } = await window.supabaseClient
                .from('profiles')
                .insert({
                  id: currentUser.id,
                  first_name: 'Admin',
                  last_name: 'Administrator',
                  full_name: 'Admin Administrator',
                  email: currentUser.email.toLowerCase(),
                  phone: '',
                  membership_status: 'active',
                  user_role: 'admin'
                });

              if (createError) {
                console.error('Error creating admin profile:', createError);
              } else {
                console.log('Admin profile created successfully');
                // Fetch the newly created profile
                profile = await window.churchAuth.getUserProfile();
              }
            } catch (createError) {
              console.error('Failed to create admin profile:', createError);
            }
          }

          const role = (profile?.user_role || '').toLowerCase();
          console.log('Admin login - user role:', role);

          if (!profile || role !== 'admin') {
            showFeedback('This account is not authorized as admin.', 'error');
            resetBtn(getCodeBtn, '<i class="fas fa-key text-xs"></i> <span>Sign In & Get Admin Code</span>');
            return;
          }

          // Generate code on server
          setBtnLoading(getCodeBtn, 'Generating Code...');
          const { data, error } = await window.supabaseClient.rpc('generate_admin_code');
          if (error) {
            console.error('generate_admin_code error:', error);
            showFeedback(error.message || 'Failed to generate admin code.', 'error');
            resetBtn(getCodeBtn, '<i class="fas fa-key text-xs"></i> <span>Sign In & Get Admin Code</span>');
            return;
          }

          const generated = data; // text (not shown to user)
          // Show a popup instruction instead of revealing the code
          showAdminPopup('Contact Parish Staff for Admin Code');

          // Enable step 2
          enableCodeStep();
          resetBtn(getCodeBtn, '<i class="fas fa-key text-xs"></i> <span>Sign In & Get Admin Code</span>');
        } catch (err) {
          console.error('Admin sign-in error:', err);
          showFeedback('Unable to sign in. Please try again.', 'error');
          resetBtn(getCodeBtn, '<i class="fas fa-key text-xs"></i> <span>Sign In & Get Admin Code</span>');
        }
      });
    }

    // Step 2: verify code
    if (codeForm) {
      codeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const code = (byId('admin-code')?.value || '').trim();
        if (!/^\d{6}$/.test(code)) {
          showFeedback('Please enter a valid 6-digit code.', 'error');
          return;
        }

        setBtnLoading(verifyBtn, 'Verifying...');
        try {
          const { data, error } = await window.supabaseClient.rpc('verify_admin_code', { p_code: code });
          if (error) {
            console.error('verify_admin_code error:', error);
            showFeedback(error.message || 'Verification failed.', 'error');
            resetBtn(verifyBtn, '<i class="fas fa-sign-in-alt text-xs"></i> <span>Verify & Enter Admin Dashboard</span>');
            return;
          }

          const ok = !!data;
          if (!ok) {
            showFeedback('Invalid or expired code. Please generate a new one.', 'error');
            resetBtn(verifyBtn, '<i class="fas fa-sign-in-alt text-xs"></i> <span>Verify & Enter Admin Dashboard</span>');
            return;
          }

          // Verified -> go to admin dashboard
          window.location.href = '/src/pages/admin/index.html';
        } catch (err) {
          console.error('Admin code verification error:', err);
          showFeedback('Unable to verify code. Please try again.', 'error');
          resetBtn(verifyBtn, '<i class="fas fa-sign-in-alt text-xs"></i> <span>Verify & Enter Admin Dashboard</span>');
        }
      });
    }
  });
})();