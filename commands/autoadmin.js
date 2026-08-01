// autoAdmin.js
const { Collection } = require('@whiskeysockets/baileys');

class AutoAdminSystem {
    constructor(client) {
        this.client = client;
        this.adminList = new Collection();
        this.pendingApprovals = new Collection();
        this.settings = {
            autoApprove: false,
            requireGroupApproval: true,
            maxAdmins: 10,
            adminRole: 'admin'
        };
    }

    // Initialize auto-admin system
    async initialize() {
        console.log('🔄 Initializing Auto-Admin System...');
        await this.loadAdminList();
        this.setupEventListeners();
        console.log('✅ Auto-Admin System Ready!');
    }

    // Load existing admins from database
    async loadAdminList() {
        try {
            // Replace with your database implementation
            const savedAdmins = await this.getAdminsFromDB();
            savedAdmins.forEach(admin => {
                this.adminList.set(admin.id, admin);
            });
        } catch (error) {
            console.error('Failed to load admin list:', error);
        }
    }

    // Setup event listeners for auto-admin features
    setupEventListeners() {
        this.client.ev.on('messages.upsert', async ({ messages }) => {
            for (const msg of messages) {
                if (msg.key.fromMe) continue;
                await this.handleIncomingMessage(msg);
            }
        });

        this.client.ev.on('group-participants.update', async (update) => {
            await this.handleGroupUpdate(update);
        });
    }

    // Handle incoming messages for auto-admin commands
    async handleIncomingMessage(msg) {
        const { key, message } = msg;
        const sender = key.remoteJid;
        const content = message?.conversation || message?.extendedTextMessage?.text;

        if (!content || !content.startsWith('!')) return;

        const args = content.slice(1).trim().split(' ');
        const command = args[0].toLowerCase();

        // Check if user is admin
        const isAdmin = await this.isUserAdmin(sender);

        switch (command) {
            case 'addadmin':
                if (!isAdmin) return this.sendReply(msg, '❌ You are not authorized!');
                await this.addAdmin(msg, args);
                break;

            case 'removeadmin':
                if (!isAdmin) return this.sendReply(msg, '❌ You are not authorized!');
                await this.removeAdmin(msg, args);
                break;

            case 'listadmins':
                await this.listAdmins(msg);
                break;

            case 'adminrequests':
                if (!isAdmin) return this.sendReply(msg, '❌ You are not authorized!');
                await this.viewAdminRequests(msg);
                break;

            case 'approveadmin':
                if (!isAdmin) return this.sendReply(msg, '❌ You are not authorized!');
                await this.approveAdmin(msg, args);
                break;

            case 'autoadmin':
                if (!isAdmin) return this.sendReply(msg, '❌ You are not authorized!');
                await this.toggleAutoAdmin(msg, args);
                break;

            case 'requestadmin':
                await this.requestAdminRole(msg);
                break;
        }
    }

    // Check if user has admin privileges
    async isUserAdmin(userId) {
        // Check in your admin list
        if (this.adminList.has(userId)) return true;
        
        // Check if user is group admin (optional)
        try {
            const groupMetadata = await this.client.groupMetadata(userId.split('@')[0]);
            const participant = groupMetadata.participants.find(p => p.id === userId);
            return participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch {
            return false;
        }
    }

    // Add new admin
    async addAdmin(msg, args) {
        if (args.length < 2) {
            return this.sendReply(msg, '❌ Usage: !addadmin @user [role]');
        }

        const targetUser = args[1].replace('@', '') + '@s.whatsapp.net';
        const role = args[2] || 'admin';

        if (this.adminList.has(targetUser)) {
            return this.sendReply(msg, 'ℹ️ User is already an admin!');
        }

        if (this.adminList.size >= this.settings.maxAdmins) {
            return this.sendReply(msg, `❌ Maximum admin limit (${this.settings.maxAdmins}) reached!`);
        }

        // Add to admin list
        this.adminList.set(targetUser, {
            id: targetUser,
            role: role,
            addedBy: msg.key.participant || msg.key.remoteJid,
            addedAt: new Date().toISOString(),
            permissions: this.getRolePermissions(role)
        });

        await this.saveAdminToDB(targetUser, role);
        this.sendReply(msg, `✅ @${targetUser.split('@')[0]} has been added as ${role}!`);
    }

    // Remove admin
    async removeAdmin(msg, args) {
        if (args.length < 2) {
            return this.sendReply(msg, '❌ Usage: !removeadmin @user');
        }

        const targetUser = args[1].replace('@', '') + '@s.whatsapp.net';

        if (!this.adminList.has(targetUser)) {
            return this.sendReply(msg, '❌ User is not an admin!');
        }

        this.adminList.delete(targetUser);
        await this.removeAdminFromDB(targetUser);
        this.sendReply(msg, `✅ @${targetUser.split('@')[0]} has been removed as admin!`);
    }

    // List all admins
    async listAdmins(msg) {
        if (this.adminList.size === 0) {
            return this.sendReply(msg, 'ℹ️ No admins registered.');
        }

        let adminList = '📋 *Admin List*\n\n';
        let count = 1;
        
        for (const [id, data] of this.adminList) {
            adminList += `${count}. @${id.split('@')[0]} - ${data.role}\n`;
            adminList += `   Added: ${new Date(data.addedAt).toLocaleDateString()}\n\n`;
            count++;
        }

        this.sendReply(msg, adminList);
    }

    // Request admin role
    async requestAdminRole(msg) {
        const sender = msg.key.participant || msg.key.remoteJid;

        if (this.adminList.has(sender)) {
            return this.sendReply(msg, 'ℹ️ You are already an admin!');
        }

        if (this.pendingApprovals.has(sender)) {
            return this.sendReply(msg, '⏳ You already have a pending request!');
        }

        // Add to pending approvals
        this.pendingApprovals.set(sender, {
            userId: sender,
            requestedAt: new Date().toISOString(),
            status: 'pending'
        });

        // Notify current admins
        await this.notifyAdmins('admin_request', {
            userId: sender,
            message: `🔔 New admin request from @${sender.split('@')[0]}`
        });

        this.sendReply(msg, '✅ Admin request sent! Please wait for approval.');
    }

    // Approve admin request
    async approveAdmin(msg, args) {
        if (args.length < 2) {
            return this.sendReply(msg, '❌ Usage: !approveadmin @user');
        }

        const targetUser = args[1].replace('@', '') + '@s.whatsapp.net';

        if (!this.pendingApprovals.has(targetUser)) {
            return this.sendReply(msg, '❌ No pending request found for this user!');
        }

        // Add as admin
        this.adminList.set(targetUser, {
            id: targetUser,
            role: 'admin',
            addedBy: msg.key.participant || msg.key.remoteJid,
            addedAt: new Date().toISOString(),
            permissions: this.getRolePermissions('admin')
        });

        this.pendingApprovals.delete(targetUser);
        await this.saveAdminToDB(targetUser, 'admin');

        this.sendReply(msg, `✅ @${targetUser.split('@')[0]} has been approved as admin!`);
    }

    // Toggle auto-admin mode
    async toggleAutoAdmin(msg, args) {
        if (args.length < 2) {
            return this.sendReply(msg, '❌ Usage: !autoadmin [on/off]');
        }

        const state = args[1].toLowerCase();
        
        if (state === 'on') {
            this.settings.autoApprove = true;
            this.sendReply(msg, '✅ Auto-admin mode ENABLED! New requests will be auto-approved.');
        } else if (state === 'off') {
            this.settings.autoApprove = false;
            this.sendReply(msg, '❌ Auto-admin mode DISABLED! All requests need manual approval.');
        } else {
            this.sendReply(msg, '❌ Invalid option! Use "on" or "off".');
        }
    }

    // Handle group updates (auto-admin features)
    async handleGroupUpdate(update) {
        const { id, participants, action } = update;

        if (action === 'add' && this.settings.autoApprove) {
            for (const participant of participants) {
                if (!this.adminList.has(participant)) {
                    // Auto-add as admin
                    this.adminList.set(participant, {
                        id: participant,
                        role: 'admin',
                        addedBy: 'system',
                        addedAt: new Date().toISOString(),
                        permissions: this.getRolePermissions('admin')
                    });
                    await this.saveAdminToDB(participant, 'admin');
                    
                    // Send welcome message
                    await this.client.sendMessage(id, {
                        text: `🎉 Welcome @${participant.split('@')[0]}! You've been auto-promoted to admin.`,
                        mentions: [participant]
                    });
                }
            }
        }
    }

    // Get role permissions
    getRolePermissions(role) {
        const permissions = {
            admin: ['add_admin', 'remove_admin', 'list_admins', 'approve_requests', 'manage_settings'],
            superadmin: ['add_admin', 'remove_admin', 'list_admins', 'approve_requests', 'manage_settings', 'modify_permissions'],
            moderator: ['list_admins', 'approve_requests']
        };
        return permissions[role] || permissions.admin;
    }

    // Notify all admins
    async notifyAdmins(event, data) {
        for (const [adminId] of this.adminList) {
            try {
                await this.client.sendMessage(adminId, {
                    text: data.message,
                    mentions: [data.userId]
                });
            } catch (error) {
                console.error(`Failed to notify admin ${adminId}:`, error);
            }
        }
    }

    // Send reply helper
    async sendReply(msg, text) {
        try {
            await this.client.sendMessage(msg.key.remoteJid, {
                text: text,
                mentions: [msg.key.participant || msg.key.remoteJid]
            });
        } catch (error) {
            console.error('Failed to send reply:', error);
        }
    }

    // Database methods (implement according to your database)
    async getAdminsFromDB() {
        // Implement your database logic here
        return [];
    }

    async saveAdminToDB(userId, role) {
        // Implement your database logic here
    }

    async removeAdminFromDB(userId) {
        // Implement your database logic here
    }

    // View pending admin requests
    async viewAdminRequests(msg) {
        if (this.pendingApprovals.size === 0) {
            return this.sendReply(msg, 'ℹ️ No pending admin requests.');
        }

        let requestList = '📋 *Pending Admin Requests*\n\n';
        let count = 1;

        for (const [id, data] of this.pendingApprovals) {
            requestList += `${count}. @${id.split('@')[0]}\n`;
            requestList += `   Requested: ${new Date(data.requestedAt).toLocaleDateString()}\n\n`;
            count++;
        }

        this.sendReply(msg, requestList);
    }
}

module.exports = AutoAdminSystem;
