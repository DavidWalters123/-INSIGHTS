import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';
import { nanoid } from 'nanoid';

interface InviteOptions {
  type: 'community' | 'creator';
  targetId: string; // community ID or creator ID
  expiresIn?: number; // hours
  maxUses?: number;
}

export async function createInviteLink(options: InviteOptions) {
  if (!auth.currentUser) {
    throw new Error('Must be logged in to create invites');
  }

  try {
    const code = nanoid(10);
    const expiresAt = options.expiresIn 
      ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000)
      : null;

    const inviteData = {
      code,
      type: options.type,
      targetId: options.targetId,
      createdBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      expiresAt,
      maxUses: options.maxUses || null,
      uses: 0,
      active: true
    };

    await addDoc(collection(db, 'invites'), inviteData);

    // Generate the invite URL
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/invite/${code}`;

    return inviteUrl;
  } catch (error) {
    console.error('Error creating invite:', error);
    throw error;
  }
}

export async function validateInvite(code: string) {
  try {
    // Query for the invite
    const invitesRef = collection(db, 'invites');
    const snapshot = await getDoc(doc(invitesRef, code));

    if (!snapshot.exists()) {
      throw new Error('Invalid invite code');
    }

    const invite = snapshot.data();

    // Check if invite is active
    if (!invite.active) {
      throw new Error('This invite has been deactivated');
    }

    // Check expiration
    if (invite.expiresAt && invite.expiresAt.toDate() < new Date()) {
      throw new Error('This invite has expired');
    }

    // Check max uses
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new Error('This invite has reached its maximum uses');
    }

    return invite;
  } catch (error) {
    console.error('Error validating invite:', error);
    throw error;
  }
}

export async function useInvite(code: string) {
  if (!auth.currentUser) {
    throw new Error('Must be logged in to use an invite');
  }

  try {
    const invite = await validateInvite(code);

    // Update invite uses
    const inviteRef = doc(db, 'invites', code);
    await updateDoc(inviteRef, {
      uses: invite.uses + 1,
      active: invite.maxUses ? invite.uses + 1 < invite.maxUses : true
    });

    // Handle the invite based on type
    if (invite.type === 'community') {
      await addDoc(collection(db, 'community_members'), {
        community_id: invite.targetId,
        user_id: auth.currentUser.uid,
        role: 'member',
        joined_at: serverTimestamp()
      });
      toast.success('Successfully joined the community!');
    } else {
      // Handle creator invite logic
      // This could be adding them as a collaborator, team member, etc.
      toast.success('Successfully accepted creator invite!');
    }

    return invite;
  } catch (error) {
    console.error('Error using invite:', error);
    throw error;
  }
}

export async function deactivateInvite(code: string) {
  if (!auth.currentUser) {
    throw new Error('Must be logged in to deactivate invites');
  }

  try {
    const inviteRef = doc(db, 'invites', code);
    await updateDoc(inviteRef, {
      active: false
    });
    toast.success('Invite link deactivated');
  } catch (error) {
    console.error('Error deactivating invite:', error);
    throw error;
  }
}