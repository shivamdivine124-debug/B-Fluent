
import React, { useState } from 'react';
import { RAZORPAY_KEY_ID, SUBSCRIPTION_PLANS, SubscriptionPlan } from '../constants';
import { User } from '../types';

interface SubscriptionProps {
  user: User | null;
  onSuccess: (plan: SubscriptionPlan) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Subscription: React.FC<SubscriptionProps> = ({ user, onSuccess, onCancel }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('monthly');
  const [loading, setLoading] = useState(false);

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const handlePayment = () => {
    setLoading(true);
    
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: selectedPlan.price * 100, // Amount in paise
      currency: "INR",
      name: "B Fluent",
      description: `Upgrade to ${selectedPlan.name}`,
      image: "https://api.dicebear.com/7.x/initials/svg?seed=BF&backgroundColor=6366f1",
      handler: function (response: any) {
        console.log("Payment Success", response.razorpay_payment_id);
        onSuccess(selectedPlan);
        setLoading(false);
      },
      prefill: {
        name: "Learner",
        email: user?.email || "",
      },
      theme: {
        color: "#6366F1"
      },
      modal: {
        ondismiss: function() {
            setLoading(false);
        }
      }
    };

    try {
      if (window.Razorpay) {
          const rzp1 = new window.Razorpay(options);
          rzp1.open();
      } else {
          alert("Payment gateway currently unavailable. Please check your connection.");
          setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-slate-900 flex flex-col p-6 overflow-y-auto font-sans relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="text-center mb-10 pt-4">
            <h2 className="text-3xl font-black text-white mb-2">Master English</h2>
            <p className="text-slate-400 font-medium">Unlock full potential with Premium access.</p>
        </div>

        <div className="w-full space-y-4 mb-8">
            {SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                    <button
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`w-full relative rounded-2xl p-5 transition-all duration-300 border-2 text-left ${
                            isSelected 
                                ? 'bg-indigo-600/20 border-indigo-500 shadow-xl' 
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                    >
                        {plan.label && (
                            <div className="absolute -top-3 right-4 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-900">
                                {plan.label}
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                            <span className="text-xl font-black text-white">₹{plan.price}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{plan.description}</p>
                    </button>
                );
            })}
        </div>

        <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Included Features</h4>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                    <span className="text-green-400">✓</span> Unlimited AI Sonia Voice Chat
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                    <span className="text-green-400">✓</span> Complete 60-Day Spoken Course
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                    <span className="text-green-400">✓</span> Advanced Quiz Arena Access
                </li>
            </ul>
        </div>

        <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-14 rounded-2xl font-black text-lg transition transform active:scale-95 disabled:opacity-70 flex items-center justify-center"
        >
            {loading ? "Processing..." : `Pay ₹${selectedPlan.price}`}
        </button>

        <button 
            onClick={onCancel}
            className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition"
        >
            Maybe later
        </button>
      </div>
    </div>
  );
};

export default Subscription;
