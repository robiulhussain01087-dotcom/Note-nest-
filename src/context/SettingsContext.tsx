import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings, PaymentSettings } from '../types';
import { NoteNestDB } from '../services/db';
import { AdminService } from '../services/adminService';
import { getActiveQrCodePath } from '../utils/assetService';

interface SettingsContextType {
  websiteSettings: WebsiteSettings;
  paymentSettings: PaymentSettings;
  updateWebsiteSettings: (newSettings: Partial<WebsiteSettings>, userEmail?: string) => Promise<void>;
  updatePaymentSettings: (newSettings: Partial<PaymentSettings>, userEmail?: string) => Promise<void>;
  setActiveQrCode: (qrId: 'qr-1' | 'qr-2' | 'qr-3', userEmail?: string) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(NoteNestDB.getWebsiteSettings());
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(NoteNestDB.getPaymentSettings());

  const reloadSettings = async () => {
    try {
      const firestoreSettings = await AdminService.fetchSettings();
      if (firestoreSettings) {
        if (firestoreSettings.logoUrl !== undefined) {
          setWebsiteSettings(prev => ({
            ...prev,
            logoUrl: firestoreSettings.logoUrl || '/assets/notenest-logo.png',
            siteName: firestoreSettings.siteName || prev.siteName,
            tagline: firestoreSettings.tagline || prev.tagline,
            supportEmail: firestoreSettings.supportEmail || prev.supportEmail,
            phone: firestoreSettings.phone || prev.phone,
            primaryCourse: firestoreSettings.primaryCourse || prev.primaryCourse,
            primarySemester: firestoreSettings.primarySemester || prev.primarySemester
          }));
        }
        if (firestoreSettings.activeQrCode || firestoreSettings.qrCodeUrl || firestoreSettings.upiId) {
          const validActiveQr = (firestoreSettings.activeQrCode === 'qr-2' || firestoreSettings.activeQrCode === 'qr-3')
            ? firestoreSettings.activeQrCode
            : 'qr-1';
          setPaymentSettings(prev => ({
            ...prev,
            activeQrCode: validActiveQr,
            qrCodeUrl: getActiveQrCodePath(validActiveQr),
            upiId: firestoreSettings.upiId || prev.upiId,
            accountName: firestoreSettings.accountName || prev.accountName,
            instructions: firestoreSettings.instructions || prev.instructions,
            enabled: firestoreSettings.enabled !== undefined ? firestoreSettings.enabled : prev.enabled,
            logoUrl: firestoreSettings.logoUrl || prev.logoUrl
          }));
        }
      }
    } catch (err) {
      console.warn('[SettingsContext] Could not fetch Firestore settings:', err);
    }
  };

  useEffect(() => {
    setWebsiteSettings(NoteNestDB.getWebsiteSettings());
    setPaymentSettings(NoteNestDB.getPaymentSettings());
    reloadSettings();
  }, []);

  const updateWebsiteSettings = async (newSettings: Partial<WebsiteSettings>, userEmail?: string) => {
    const updated = { ...websiteSettings, ...newSettings };
    NoteNestDB.saveWebsiteSettings(updated);
    setWebsiteSettings(updated);

    try {
      await AdminService.saveBrandingSettings(newSettings, userEmail);
    } catch (err) {
      console.warn('[SettingsContext] Error saving website settings to Firestore:', err);
    }
  };

  const updatePaymentSettings = async (newSettings: Partial<PaymentSettings>, userEmail?: string) => {
    const updated: PaymentSettings = {
      ...paymentSettings,
      ...newSettings,
      methodName: newSettings.methodName ?? paymentSettings.methodName ?? 'UPI Payment',
      enabled: newSettings.enabled ?? paymentSettings.enabled ?? true
    };
    NoteNestDB.savePaymentSettings(updated);
    setPaymentSettings(updated);

    // Sync to Firestore /settings/payment
    try {
      await AdminService.savePaymentSettings(updated, userEmail);
    } catch (err) {
      console.warn('[SettingsContext] Error saving payment settings to Firestore:', err);
    }
  };

  const setActiveQrCode = async (qrId: 'qr-1' | 'qr-2' | 'qr-3', userEmail?: string) => {
    const validQr = (qrId === 'qr-2' || qrId === 'qr-3') ? qrId : 'qr-1';
    const qrPath = getActiveQrCodePath(validQr);

    const updated: PaymentSettings = {
      ...paymentSettings,
      activeQrCode: validQr,
      qrCodeUrl: qrPath
    };
    NoteNestDB.savePaymentSettings(updated);
    setPaymentSettings(updated);

    try {
      await AdminService.saveActiveQrCode(validQr, userEmail);
    } catch (err) {
      console.warn('[SettingsContext] Error saving active QR to Firestore:', err);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        websiteSettings,
        paymentSettings,
        updateWebsiteSettings,
        updatePaymentSettings,
        setActiveQrCode,
        reloadSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
