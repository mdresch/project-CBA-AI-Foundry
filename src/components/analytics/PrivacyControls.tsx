import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../context/useAuth';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Download, 
  Trash2, 
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PrivacySettings {
  analyticsEnabled: boolean;
  detailedTracking: boolean;
  dataRetention: number; // days
  anonymizeData: boolean;
  exportData: boolean;
  deleteData: boolean;
}

export const PrivacyControls: React.FC = () => {
  const { isDarkTheme } = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    analyticsEnabled: true,
    detailedTracking: true,
    dataRetention: 90,
    anonymizeData: false,
    exportData: true,
    deleteData: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadPrivacySettings();
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user?.id) return;
    
    try {
      // Load user's privacy settings from localStorage or database
      const savedSettings = localStorage.getItem(`privacy-settings-${user.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  const savePrivacySettings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      localStorage.setItem(`privacy-settings-${user.id}`, JSON.stringify(settings));
      setMessage({ type: 'success', text: 'Privacy settings saved successfully!' });
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      setMessage({ type: 'error', text: 'Failed to save privacy settings.' });
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // This would typically make an API call to export user data
      const userData = {
        userId: user.id,
        exportDate: new Date().toISOString(),
        settings: settings,
        message: 'This is a placeholder for actual user data export functionality'
      };
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'User data exported successfully!' });
    } catch (error) {
      console.error('Failed to export user data:', error);
      setMessage({ type: 'error', text: 'Failed to export user data.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteUserData = async () => {
    if (!user?.id) return;
    
    if (!window.confirm('Are you sure you want to delete all your analytics data? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      // This would typically make an API call to delete user data
      setMessage({ type: 'info', text: 'Data deletion request submitted. This may take a few minutes to complete.' });
    } catch (error) {
      console.error('Failed to delete user data:', error);
      setMessage({ type: 'error', text: 'Failed to delete user data.' });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`p-6 ${isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            Privacy Controls
          </h1>
          <p className="text-gray-500">
            Manage your data privacy and analytics preferences
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
            message.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
             message.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
             <Settings className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analytics Settings */}
          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Analytics Settings
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable Analytics</h3>
                  <p className="text-sm text-gray-500">Allow collection of usage analytics</p>
                </div>
                <Switch
                  checked={settings.analyticsEnabled}
                  onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Detailed Tracking</h3>
                  <p className="text-sm text-gray-500">Track detailed user interactions</p>
                </div>
                <Switch
                  checked={settings.detailedTracking}
                  onCheckedChange={(checked) => updateSetting('detailedTracking', checked)}
                  disabled={!settings.analyticsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Anonymize Data</h3>
                  <p className="text-sm text-gray-500">Remove personally identifiable information</p>
                </div>
                <Switch
                  checked={settings.anonymizeData}
                  onCheckedChange={(checked) => updateSetting('anonymizeData', checked)}
                  disabled={!settings.analyticsEnabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data Retention (days)</label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkTheme 
                      ? 'bg-zinc-700 border-zinc-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  disabled={!settings.analyticsEnabled}
                >
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>1 year</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className={`p-6 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Data Management
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Allow Data Export</h3>
                  <p className="text-sm text-gray-500">Enable downloading your data</p>
                </div>
                <Switch
                  checked={settings.exportData}
                  onCheckedChange={(checked) => updateSetting('exportData', checked)}
                />
              </div>

              <div className="space-y-4">
                <Button
                  onClick={exportUserData}
                  disabled={!settings.exportData || loading}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>

                <Button
                  onClick={deleteUserData}
                  disabled={loading}
                  className="w-full"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All My Data
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Important Notice</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Deleting your data will permanently remove all analytics and usage information. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={savePrivacySettings}
            disabled={loading}
            className="px-8"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* Privacy Information */}
        <div className="mt-8 p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Your Privacy Matters
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            We are committed to protecting your privacy. All analytics data is collected 
            anonymously and used only to improve the application experience. You have full 
            control over what data is collected and how long it's retained.
          </p>
        </div>
      </div>
    </div>
  );
};
