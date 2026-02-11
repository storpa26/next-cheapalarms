/**
 * Service for fetching and processing customer data
 * Handles WordPress users and GHL contacts
 *
 * SERVER-SIDE ONLY — called from getServerSideProps.
 * All WordPress calls go through wpFetch (never raw fetch + WP_API_BASE).
 */

import { wpFetch } from "../../wp.server";
import { cookieHeader } from "../utils/request-utils";

/**
 * Fetches WordPress users with portal access
 * @param {Request} req - Next.js request object (for server-side)
 * @returns {Promise<Array>} Array of WP users
 */
export async function getWordPressUsers(req) {
  const data = await wpFetch("/ca/v1/users", {
    headers: cookieHeader(req),
  });

  if (!data.ok) {
    throw new Error(data.error || "Failed to fetch WordPress users");
  }

  return data.users ?? [];
}

/**
 * Fetches GHL contacts
 * @param {Request} req - Next.js request object (for server-side)
 * @param {number} limit - Number of contacts to fetch
 * @returns {Promise<Array>} Array of GHL contacts
 * @note GHL API doesn't support offset parameter for /contacts/ endpoint
 */
export async function getGHLContacts(req, limit = 50) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit.toString());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  const data = await wpFetch(`/ca/v1/ghl/contacts/list${queryString}`, {
    headers: cookieHeader(req),
  });

  if (!data.ok) {
    throw new Error(data.error || "Failed to fetch GHL contacts");
  }

  // Handle different response structures
  const contacts = data.contacts ?? data.contact ?? (Array.isArray(data) ? data : []);

  return contacts;
}

/**
 * Matches GHL contacts to WordPress users by email
 * @param {Array} ghlContacts - Array of GHL contacts
 * @param {Array} wpUsers - Array of WordPress users
 * @returns {Array} GHL contacts with matched user info and status
 */
export function matchContactsToUsers(ghlContacts, wpUsers) {
  // Create email lookup map for WP users
  const userByEmail = new Map();
  wpUsers.forEach((user) => {
    if (user.email) {
      userByEmail.set(user.email.toLowerCase(), user);
    }
  });

  // Create GHL contact ID lookup map
  const userByGhlId = new Map();
  wpUsers.forEach((user) => {
    if (user.ghlContactId) {
      userByGhlId.set(user.ghlContactId, user);
    }
  });

  return ghlContacts.map((contact) => {
    const email = (contact.email || "").toLowerCase();
    const matchedByEmail = email ? userByEmail.get(email) : null;
    const matchedByGhlId = contact.id ? userByGhlId.get(contact.id) : null;

    // Prefer email match, fallback to GHL ID match
    const matchedUser = matchedByEmail || matchedByGhlId;

    let status = "no_account";
    if (matchedUser) {
      if (matchedUser.ghlContactId === contact.id) {
        status = "linked";
      } else if (matchedUser.hasPortal) {
        status = "has_account";
      } else {
        status = "needs_invite";
      }
    }

    return {
      ...contact,
      matchedUserId: matchedUser?.id ?? null,
      matchedUser: matchedUser ?? null,
      status,
    };
  });
}

/**
 * Gets customer status badge info
 * @param {string} status - Contact status
 * @returns {Object} Badge configuration
 */
export function getStatusBadge(status) {
  const badges = {
    linked: { label: "Linked", variant: "default" },
    has_account: { label: "Has Account", variant: "secondary" },
    needs_invite: { label: "Needs Invite", variant: "outline" },
    no_account: { label: "No Account", variant: "outline" }, // Changed from destructive to outline for better visibility
  };

  return badges[status] || { label: "Unknown", variant: "outline" };
}
