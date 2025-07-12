import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'terms' | 'privacy';
}

const TermsModal = ({ open, onOpenChange, type }: TermsModalProps) => {
    const isTerms = type === 'terms';

    const content = isTerms ? (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">TERMS OF SERVICE</h3>

            <p className="text-sm text-gray-400 mb-4">Last updated: July 11, 2025</p>
            <p className="text-sm text-gray-400 mb-4">
                Welcome to GamePlan AI. These Terms of Service (“Terms”) govern your use of our platform. By using GamePlan AI, you agree to these Terms.
            </p>
            <section>
                <h4 className="font-medium mb-2 text-lg text-lg">1. Service Overview</h4>
                <p className="text-sm text-gray-400 mb-4">
                    GamePlan AI provides AI-powered sports predictions. We do not facilitate betting or real-money gambling. All predictions are informational only.
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">2. Eligibility</h4>
                <p className="text-sm text-gray-400 mb-4">
                    You must be 18 years or older or the legal age in your jurisdiction to use GamePlan AI.
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">3. No Guarantee of Results </h4>
                <p className="text-sm text-gray-400 mb-4">
                    We do not promise or guarantee the accuracy of predictions. All decisions made using the platform are your responsibility. GamePlan AI is not liable for any outcomes or losses.
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">4. Acceptable Use</h4>
                <p className="text-sm text-gray-400 mb-4">
                    Do not:
                    <li>Abuse the platform or its features</li>
                    <li>Attempt to reverse-engineer our system</li>
                    <li>Share your account without permission</li>
                    <li>Use bots or automated scripts</li>
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">5. Subscription & Billing</h4>
                <p className="text-sm text-gray-400 mb-4">
                    If applicable, you agree to pay for your selected subscription plan. Billing is handled securely via Stripe.
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">6. 6. Intellectual Property</h4>
                <p className="text-sm text-gray-400 mb-4">
                    All content, code, models, and branding belong to GamePlan AI. You may not reuse or distribute any materials without written permission.
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">7. Termination</h4>
                <p className="text-sm text-gray-400 mb-4">
                    We may suspend or terminate accounts that violate these Terms or abuse the platform.
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">8. Changes to Terms</h4>
                <p className="text-sm text-gray-400 mb-4">
                    We may update these Terms periodically. Continued use means you accept the changes.
                </p>
            </section>
            <section>
                <h4 className="font-medium mb-2 text-lg">9. Jurisdiction</h4>
                <p className="text-sm text-gray-400 mb-4">
                    These Terms are governed by the laws of Quebec, Canada. Any legal matters will be handled within this jurisdiction.
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">10. Contact Us</h4>
                <p className="text-sm text-gray-400 mb-4">
                    Email: support@gameplanai.io
                </p>
            </section>
        </div>
    ) : (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Privacy Policy</h3>
            <p className="text-sm text-gray-400 mb-4">Last updated: July 11, 2025</p>
            <p className="text-sm text-gray-400 mb-4">GamePlan AI (“we”, “our”, “us”) respects your privacy. This Privacy Policy outlines how we collect, use, and protect your information when you use our services.</p>

            <section>
                <h4 className="font-medium mb-2 text-lg">1. Information We Collect</h4>
                <p className="text-sm text-gray-400 mb-4">
                    We may collect the following data:
                    Email address and name (if provided)
                    Usage data and device/browser info (via Google Analytics)
                    AI prompt interactions
                    Payment information (via Stripe, if applicable)
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">2. How We Use Your Information</h4>
                <p className="text-sm text-gray-400 mb-4">
                    To deliver personalized sports predictions
                    To improve platform performance
                    To send updates and respond to support inquiries
                    For internal analytics and usage trends
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">3. Data Sharing</h4>
                <p className="text-sm text-gray-400 mb-4">
                    We do not sell or rent your data. We may share limited data with trusted third parties like:
                    Google Analytics (usage tracking)
                    Stripe (for handling payments)
                    Hosting providers (to run the platform)
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">4. Security</h4>
                <p className="text-sm text-gray-400 mb-4">
                    We use modern security measures, but no platform is 100% secure. Use the platform at your own risk.
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">5. Your Rights</h4>
                <p className="text-sm text-gray-400 mb-4">
                    You can request access, updates, or deletion of your personal data by emailing support@gameplanai.io
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">6. Jurisdiction</h4>
                <p className="text-sm text-gray-400 mb-4">
                    We operate under the laws of the Province of Quebec, Canada.
                </p>
            </section>

            <section>
                <h4 className="font-medium mb-2 text-lg">7. Contact Us</h4>
                <p className="text-sm text-gray-400 mb-4">
                    Email: support@gameplanai.io
                </p>
            </section>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] bg-[#333333b5] border border-[#4E4E50]">
                <DialogHeader>
                    <DialogDescription className="text-gray-400">
                        Please read these {isTerms ? 'terms and conditions' : 'privacy policy'} carefully before using our service.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4 text-white">
                        {content}
                    </div>
                </ScrollArea>

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="bg-[#0EADAB] hover:bg-[#0EADAB]/80 text-white"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TermsModal; 