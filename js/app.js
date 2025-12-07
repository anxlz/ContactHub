// ContactHub - Simplified Version (No Class)
// Global Variables
let contacts = [];
let currentEditId = null;
let modal = null;

// Initialize
function init() {
    loadContacts();
    renderContacts();
    updateStats();
    setupEventListeners();
}

// Load from LocalStorage
function loadContacts() {
    const saved = localStorage.getItem('contacts');
    contacts = saved ? JSON.parse(saved) : [];
}

// Save to LocalStorage
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Setup Event Listeners
function setupEventListeners() {
    modal = new bootstrap.Modal(document.getElementById('contactModal'));
    
    document.getElementById('addContactBtn').addEventListener('click', openModal);
    document.getElementById('contactForm').addEventListener('submit', saveContact);
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchContacts(e.target.value);
    });
    document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);
}

// Open Modal
function openModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add New Contact';
    resetForm();
    modal.show();
}

// Reset Form
function resetForm() {
    document.getElementById('contactForm').reset();
    document.getElementById('contactId').value = '';
    document.getElementById('avatarPath').value = '';
    document.getElementById('avatarPreview').innerHTML = '<i class="fas fa-user"></i>';
    
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => input.classList.remove('is-invalid'));
    
    currentEditId = null;
}

// Validate Form
function validateForm(data) {
    let isValid = true;
    
    // Name validation
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const nameInput = document.getElementById('contactName');
    if (!nameRegex.test(data.name)) {
        nameInput.classList.add('is-invalid');
        isValid = false;
    } else {
        nameInput.classList.remove('is-invalid');
    }
    
    // Phone validation
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    const phoneInput = document.getElementById('contactPhone');
    if (!phoneRegex.test(data.phone)) {
        phoneInput.classList.add('is-invalid');
        isValid = false;
    } else {
        phoneInput.classList.remove('is-invalid');
    }
    
    // Email validation
    const emailInput = document.getElementById('contactEmail');
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            emailInput.classList.add('is-invalid');
            isValid = false;
        } else {
            emailInput.classList.remove('is-invalid');
        }
    } else {
        emailInput.classList.remove('is-invalid');
    }
    
    return isValid;
}

// Save Contact
function saveContact(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('contactName').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        address: document.getElementById('contactAddress').value.trim(),
        group: document.getElementById('contactGroup').value,
        notes: document.getElementById('contactNotes').value.trim(),
        favorite: document.getElementById('contactFavorite').checked,
        emergency: document.getElementById('contactEmergency').checked,
        avatar: document.getElementById('avatarPath').value
    };
    
    if (!validateForm(data)) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please check the form for errors',
            confirmButtonColor: '#7c3aed'
        });
        return;
    }
    
    if (currentEditId) {
        // Update
        const index = contacts.findIndex(c => c.id === currentEditId);
        if (index !== -1) {
            contacts[index] = { ...contacts[index], ...data };
            saveContacts();
            modal.hide();
            
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Contact has been updated',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } else {
        // Add
        const newContact = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date().toISOString()
        };
        contacts.push(newContact);
        saveContacts();
        modal.hide();
        
        Swal.fire({
            icon: 'success',
            title: 'Added!',
            text: 'Contact has been added',
            timer: 2000,
            showConfirmButton: false
        });
    }
    
    renderContacts();
    updateStats();
}

// Delete Contact
function deleteContact(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            contacts = contacts.filter(c => c.id !== id);
            saveContacts();
            renderContacts();
            updateStats();
            
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Contact has been deleted',
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}

// Edit Contact
function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    
    currentEditId = contact.id;
    document.getElementById('modalTitle').textContent = 'Edit Contact';
    
    document.getElementById('contactId').value = contact.id;
    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactPhone').value = contact.phone;
    document.getElementById('contactEmail').value = contact.email || '';
    document.getElementById('contactAddress').value = contact.address || '';
    document.getElementById('contactGroup').value = contact.group || '';
    document.getElementById('contactNotes').value = contact.notes || '';
    document.getElementById('contactFavorite').checked = contact.favorite || false;
    document.getElementById('contactEmergency').checked = contact.emergency || false;
    document.getElementById('avatarPath').value = contact.avatar || '';
    
    const avatarPreview = document.getElementById('avatarPreview');
    if (contact.avatar) {
        avatarPreview.innerHTML = '<img src="' + contact.avatar + '" alt="' + contact.name + '">';
    } else {
        avatarPreview.innerHTML = getInitials(contact.name);
    }
    
    modal.show();
}

// Toggle Favorite
function toggleFavorite(id) {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
        contact.favorite = !contact.favorite;
        saveContacts();
        renderContacts();
        updateStats();
    }
}

// Handle Avatar Upload
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarPreview = document.getElementById('avatarPreview');
            avatarPreview.innerHTML = '<img src="' + e.target.result + '" alt="Avatar">';
            document.getElementById('avatarPath').value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Get Initials
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// Render Contacts
function renderContacts(contactsToRender) {
    if (!contactsToRender) contactsToRender = contacts;
    
    const contactsList = document.getElementById('contactsList');
    
    if (contactsToRender.length === 0) {
        contactsList.innerHTML = '<div class="col-12"><div class="empty-state"><div class="empty-icon"><i class="fas fa-address-book"></i></div><p class="text-muted fw-medium mb-1">No contacts found</p><p class="text-muted small">Click "Add Contact" to get started</p></div></div>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < contactsToRender.length; i++) {
        const contact = contactsToRender[i];
        
        html += '<div class="col-12 col-md-6"><div class="contact-card"><div class="d-flex align-items-start gap-3">';
        
        // Avatar
        if (contact.avatar) {
            html += '<img src="' + contact.avatar + '" alt="' + contact.name + '" class="contact-avatar">';
        } else {
            html += '<div class="contact-avatar-placeholder">' + getInitials(contact.name) + '</div>';
        }
        
        // Contact Info
        html += '<div class="flex-grow-1 min-w-0"><div class="d-flex align-items-start justify-content-between mb-2"><div class="flex-grow-1 min-w-0"><h3 class="mb-1 fw-bold fs-6">' + contact.name + '</h3>';
        
        if (contact.group) {
            html += '<span class="badge badge-' + contact.group + '">' + contact.group + '</span>';
        }
        
        html += '</div><button class="btn btn-sm btn-favorite ' + (contact.favorite ? 'active' : '') + '" onclick="toggleFavorite(\'' + contact.id + '\')"><i class="fas fa-star"></i></button></div>';
        
        // Phone & Email
        html += '<div class="mb-2 small"><div class="d-flex align-items-center gap-2 mb-1 text-muted"><i class="fas fa-phone" style="width: 14px;"></i><span>' + contact.phone + '</span></div>';
        
        if (contact.email) {
            html += '<div class="d-flex align-items-center gap-2 text-muted"><i class="fas fa-envelope" style="width: 14px;"></i><span class="text-truncate">' + contact.email + '</span></div>';
        }
        
        // Action Buttons
        html += '</div><div class="d-flex gap-2"><a href="tel:' + contact.phone + '" class="action-btn btn-call" title="Call"><i class="fas fa-phone"></i></a>';
        
        if (contact.email) {
            html += '<a href="mailto:' + contact.email + '" class="action-btn btn-email" title="Email"><i class="fas fa-envelope"></i></a>';
        }
        
        html += '<button class="action-btn btn-edit" onclick="editContact(\'' + contact.id + '\')" title="Edit"><i class="fas fa-edit"></i></button>';
        html += '<button class="action-btn btn-delete" onclick="deleteContact(\'' + contact.id + '\')" title="Delete"><i class="fas fa-trash"></i></button>';
        html += '</div></div></div></div></div>';
    }
    
    contactsList.innerHTML = html;
    renderFavorites();
    renderEmergency();
}

// Render Favorites
function renderFavorites() {
    const favorites = contacts.filter(c => c.favorite);
    const favoritesList = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="text-center py-4"><p class="text-muted small mb-0">No favorites yet</p></div>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < favorites.length; i++) {
        const contact = favorites[i];
        html += '<div class="favorite-item" onclick="editContact(\'' + contact.id + '\')">';
        
        if (contact.avatar) {
            html += '<img src="' + contact.avatar + '" alt="' + contact.name + '" class="favorite-avatar">';
        } else {
            html += '<div class="favorite-avatar contact-avatar-placeholder" style="width: 40px; height: 40px; font-size: 16px;">' + getInitials(contact.name) + '</div>';
        }
        
        html += '<div class="flex-grow-1 min-w-0"><p class="mb-0 fw-semibold small text-truncate">' + contact.name + '</p><p class="mb-0 text-muted" style="font-size: 12px;">' + contact.phone + '</p></div></div>';
    }
    
    favoritesList.innerHTML = html;
}

// Render Emergency
function renderEmergency() {
    const emergency = contacts.filter(c => c.emergency);
    const emergencyList = document.getElementById('emergencyList');
    
    if (emergency.length === 0) {
        emergencyList.innerHTML = '<div class="text-center py-4"><p class="text-muted small mb-0">No emergency contacts</p></div>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < emergency.length; i++) {
        const contact = emergency[i];
        html += '<div class="favorite-item" onclick="editContact(\'' + contact.id + '\')">';
        
        if (contact.avatar) {
            html += '<img src="' + contact.avatar + '" alt="' + contact.name + '" class="favorite-avatar">';
        } else {
            html += '<div class="favorite-avatar contact-avatar-placeholder" style="width: 40px; height: 40px; font-size: 16px;">' + getInitials(contact.name) + '</div>';
        }
        
        html += '<div class="flex-grow-1 min-w-0"><p class="mb-0 fw-semibold small text-truncate">' + contact.name + '</p><p class="mb-0 text-muted" style="font-size: 12px;">' + contact.phone + '</p></div></div>';
    }
    
    emergencyList.innerHTML = html;
}

// Search Contacts
function searchContacts(query) {
    if (!query.trim()) {
        renderContacts();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = [];
    
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        if (contact.name.toLowerCase().includes(searchTerm) ||
            contact.phone.includes(searchTerm) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm))) {
            filtered.push(contact);
        }
    }
    
    renderContacts(filtered);
}

// Update Stats
function updateStats() {
    const totalCount = contacts.length;
    const favoritesCount = contacts.filter(c => c.favorite).length;
    const emergencyCount = contacts.filter(c => c.emergency).length;
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('favoritesCount').textContent = favoritesCount;
    document.getElementById('emergencyCount').textContent = emergencyCount;
    document.getElementById('totalContactsText').textContent = totalCount;
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', init);
