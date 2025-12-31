
import React from 'react';

interface PolicyViewerProps {
  pageId: string;
  onBack?: () => void;
}

const PolicyViewer: React.FC<PolicyViewerProps> = ({ pageId, onBack }) => {
  
  const renderContent = () => {
    switch(pageId) {
      case 'contact':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-slate-800">Contact Us</h1>
            <p className="text-slate-600">We are here to help you. If you have any questions or queries, please feel free to reach out to us using the details below:</p>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Business Name</h3>
                <p className="font-bold text-slate-800">BFluent</p>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Registered Address</h3>
                <p className="text-slate-700 leading-relaxed">
                  BFluent, Indiranagar, 6th Cross,<br/>
                  Kyathsandra, Tumkuru,<br/>
                  Karnataka, India 572104
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</h3>
                <p className="text-slate-700 font-medium">6361010798</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</h3>
                <p>
                    <a href="mailto:bfluent0001@gmail.com" className="text-indigo-600 font-medium hover:underline">
                        bfluent0001@gmail.com
                    </a>
                </p>
              </div>
            </div>
          </div>
        );

      case 'refund':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-slate-800">Refund Policy</h1>
            <div className="prose prose-slate prose-sm text-slate-600">
              <p>Thank you for choosing BFluent for your English learning journey.</p>
              
              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">No Refunds on Subscriptions</h3>
              <p className="mb-4">
                Due to the digital nature of our course content and the immediate access provided to premium AI features, we generally <strong>do not offer refunds</strong> once a subscription is active and the content has been accessed.
              </p>

              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">Exceptions for Technical Issues</h3>
              <p className="mb-4">
                We are committed to a great user experience. If you face a technical error that prevents you from accessing the app or its premium features:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>You must contact our support team within <strong>5 days</strong> of purchase.</li>
                <li>Please email us at <strong>bfluent0001@gmail.com</strong> with your transaction ID and a description of the issue.</li>
                <li>If we are unable to resolve the technical issue within a reasonable timeframe, a full refund will be processed to your original payment method.</li>
              </ul>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-slate-800">Terms & Conditions</h1>
            <div className="prose prose-slate prose-sm text-slate-600 text-justify">
              <p className="text-xs text-slate-400 mb-4">Last Updated: October 2024</p>
              
              <p>Welcome to BFluent. By accessing our mobile application and website, you agree to be bound by these Terms and Conditions.</p>

              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">1. Usage of Service</h3>
              <p>You agree to use the BFluent app only for lawful purposes and for personal English learning. You must not abuse the AI features or the global chat functionality.</p>

              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">2. Delivery Policy</h3>
              <p>BFluent provides purely digital educational content. <strong>Access is delivered instantly</strong> to your account upon successful confirmation of payment. No physical shipping is involved in any of our services.</p>

              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">3. User Conduct</h3>
              <p>In the Global Connect feature, respectful behavior is mandatory. Any harassment, hate speech, or inappropriate conduct will result in immediate account termination without refund.</p>

              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">4. Jurisdiction</h3>
              <p>These terms shall be governed by and constructed in accordance with the laws of India. Any disputes arising in relation to these terms shall be subject to the exclusive jurisdiction of the courts in <strong>Tumkuru, Karnataka</strong>.</p>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-slate-800">Privacy Policy</h1>
            <div className="prose prose-slate prose-sm text-slate-600 text-justify">
              <p>At BFluent, we prioritize the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by BFluent and how we use it.</p>

              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">Information We Collect</h3>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Personal Information:</strong> When you register, we collect your Email address and optionally your Phone number to create your account.</li>
                <li><strong>Payment Information:</strong> We do not store your credit card details. All transactions are processed via secure payment gateways (Razorpay).</li>
                <li><strong>Usage Data:</strong> We collect data on your learning progress (quiz scores, day streak) to improve your experience.</li>
              </ul>

              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Provide, operate, and maintain our app.</li>
                <li>Improve, personalize, and expand our course content.</li>
                <li>Communicate with you regarding updates or support.</li>
                <li>Prevent fraud.</li>
              </ul>

              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">Data Security</h3>
              <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>

              <h3 className="text-slate-800 font-bold text-lg mt-6 mb-2">Contact Us</h3>
              <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:bfluent0001@gmail.com" className="text-indigo-600 font-medium hover:underline">bfluent0001@gmail.com</a>.</p>
            </div>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="h-full bg-slate-50 overflow-y-auto relative">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 z-10 border-b border-slate-100 mb-4 pt-16">
        <button 
          onClick={onBack}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>
      <div className="p-6 pb-24">
        {renderContent()}
      </div>
    </div>
  );
};

export default PolicyViewer;
