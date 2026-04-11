"use client";

import { useState } from 'react';

interface EmailShareProps {
  verseText: string;
  chapterNumber: number;
  verseNumber: number;
  translation?: string;
}

export default function EmailShare({ verseText, chapterNumber, verseNumber, translation }: EmailShareProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const formatEmailContent = () => {
    const baseUrl = window.location.origin;
    const subject = encodeURIComponent(`Daily Geeta - Chapter ${chapterNumber}, Verse ${verseNumber}`);
    
    const emailBody = `Dear Friend,

I wanted to share this beautiful verse from the Bhagavad Gita with you:

Chapter ${chapterNumber}, Verse ${verseNumber}

"${verseText}"

${translation ? `\nTranslation: ${translation}` : ''}

${customMessage ? `\nPersonal message: ${customMessage}` : ''}

This verse brought me peace and wisdom today. I hope it resonates with you too.

You can read more daily verses at: ${baseUrl}

With blessings,
${window.location.href.includes('premium') ? 'A Premium Devotee' : 'A fellow seeker'}`;

    return { subject, body: encodeURIComponent(emailBody) };
  };

  const openEmailClient = () => {
    const { subject, body } = formatEmailContent();
    const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  const shareViaGmail = () => {
    const { subject, body } = formatEmailContent();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const shareViaOutlook = () => {
    const { subject, body } = formatEmailContent();
    const outlookUrl = `https://outlook.live.com/mail/0/compose/new?to=${recipientEmail}&subject=${subject}&body=${body}`;
    window.open(outlookUrl, '_blank');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-bold text-orange-900 mb-4">Share Verse via Email</h3>
      
      {!showEmailForm ? (
        <div className="text-center">
          <button
            onClick={() => setShowEmailForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send via Email
          </button>
          <p className="text-sm text-gray-600 mt-2">Share this divine wisdom with friends and family</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recipient Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add your personal thoughts..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Email Preview */}
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-orange-800 mb-1">Email Preview:</p>
            <div className="text-xs text-orange-700 space-y-1">
              <p><strong>Subject:</strong> Daily Geeta - Chapter {chapterNumber}, Verse {verseNumber}</p>
              <p><strong>Verse:</strong> "{verseText.substring(0, 100)}..."</p>
              {customMessage && <p><strong>Your message:</strong> {customMessage}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={openEmailClient}
              disabled={!recipientEmail}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Open Email App
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={shareViaGmail}
                disabled={!recipientEmail}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gmail
              </button>
              <button
                onClick={shareViaOutlook}
                disabled={!recipientEmail}
                className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Outlook
              </button>
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={() => {
              setShowEmailForm(false);
              setRecipientEmail('');
              setCustomMessage('');
            }}
            className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          This will open your email client with the verse beautifully formatted. You can edit the message before sending.
        </p>
      </div>
    </div>
  );
}
