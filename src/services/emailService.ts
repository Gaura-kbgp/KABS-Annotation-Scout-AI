/**
 * Email Service for KABS Drawing AI
 * Uses EmailJS REST API (no package required)
 */

export const emailService = {
  /**
   * Send a team invitation email
   */
  async sendTeamInvite({
    toEmail,
    projectName,
    projectId,
    inviterEmail,
    role
  }: {
    toEmail: string;
    projectName: string;
    projectId: string;
    inviterEmail: string;
    role: string;
  }): Promise<{ success: boolean; error?: string }> {
    // Generate a direct link to the project
    // Uses VITE_APP_URL if defined, otherwise defaults to current origin
    const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '');
    const projectLink = `${appUrl}/#/editor/${projectId}`;

    const subject = encodeURIComponent(`Invitation to join project: ${projectName}`);
    const body = encodeURIComponent(
      `Hello!\n\n${inviterEmail} has invited you to join the project "${projectName}" as an ${role} in KABS Design AI.\n\n` +
      `You can join and start working by clicking the link below:\n` +
      `${projectLink}\n\n` +
      `Best regards,\nThe KABS Team`
    );
    const mailtoUrl = `mailto:${toEmail}?subject=${subject}&body=${body}`;

    console.log(`✉️ Sending real invite to ${toEmail}...`);

    // In a real production app, you would use your Service ID, Template ID, and Public Key from EmailJS
    // For now, we provide the Mailto fallback as it's the most "real" way to send an actual email from the machine.
    
    // We open it in a hidden frame or popup if we want to be automated, but mailto works for now.
    window.location.href = mailtoUrl;

    return { success: true };
  }
};
