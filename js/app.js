// Global Variables
var contacts = [];
var currentEditId = null;
var modal = null;

// Initialize Application
function init() {
    loadContacts();
    renderContacts();
    updateStats();
    setupEventListeners();
}

// Load Contacts from LocalStorage
function loadContacts() {
    var saved = localStorage.getItem('contacts');
    contacts = saved ? JSON.parse(saved) : [];
}

// Save Contacts to LocalStorage
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Setup Event Listeners
function setupEventListeners() {
    modal = new bootstrap.Modal(document.getElementById('contactModal'));
    
    document.getElementById('addContactBtn').addEventListener('click', function() {
        openModal();
    });
    
    document.getElementById('contactForm').addEventListener('submit', saveContact);
    
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchContacts(e.target.value);
    });
    
    document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);
    
    document.getElementById('contactModal').addEventListener('hidden.bs.modal', function() {
        resetForm();
    });
}

// Open Modal (Add or Edit)
function openModal(contact) {
    if (contact && typeof contact === 'object') {
        currentEditId = contact.id;
        document.getElementById('modalTitle').textContent = 'Edit Contact';
        populateForm(contact);
    } else {
        currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Contact';
        resetForm();
    }
    modal.show();
}

// Populate Form with Contact Data
function populateForm(contact) {
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
    
    var avatarPreview = document.getElementById('avatarPreview');
    if (contact.avatar) {
        avatarPreview.innerHTML = '<img src="' + contact.avatar + '" alt="' + contact.name + '">';
    } else {
        var initials = getInitials(contact.name);
        avatarPreview.innerHTML = initials;
    }
}

// Reset Form
function resetForm() {
    document.getElementById('contactForm').reset();
    document.getElementById('contactId').value = '';
    document.getElementById('avatarPath').value = '';
    document.getElementById('avatarPreview').innerHTML = '<i class="fas fa-user"></i>';
    
    var inputs = document.querySelectorAll('.form-control');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].classList.remove('is-invalid');
    }
    
    currentEditId = null;
}

// Validate Form Data
function validateForm(data) {
    var isValid = true;
    
    // Name Validation
    var nameRegex = /^[a-zA-Z\s]{2,50}$/;
    var nameInput = document.getElementById('contactName');
    if (!nameRegex.test(data.name)) {
        nameInput.classList.add('is-invalid');
        isValid = false;
    } else {
        nameInput.classList.remove('is-invalid');
    }
    
    // Phone Validation (Egyptian Format)
    var phoneRegex = /^(010|011|012|015)\d{8}$/;
    var phoneInput = document.getElementById('contactPhone');
    if (!phoneRegex.test(data.phone)) {
        phoneInput.classList.add('is-invalid');
        isValid = false;
    } else {
        phoneInput.classList.remove('is-invalid');
    }
    
    // Email Validation (Optional)
    var emailInput = document.getElementById('contactEmail');
    if (data.email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

// Save Contact (Create or Update)
function saveContact(e) {
    e.preventDefault();
    
    var data = {
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
        // Update Existing Contact
        var index = -1;
        for (var i = 0; i < contacts.length; i++) {
            if (contacts[i].id === currentEditId) {
                index = i;
                break;
            }
        }
        
        if (index !== -1) {
            contacts[index] = {
                id: contacts[index].id,
                name: data.name,
                phone: data.phone,
                email: data.email,
                address: data.address,
                group: data.group,
                notes: data.notes,
                favorite: data.favorite,
                emergency: data.emergency,
                avatar: data.avatar,
                createdAt: contacts[index].createdAt
            };
            
            saveContacts();
            modal.hide();
            
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Contact has been updated successfully',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } else {
        // Add New Contact
        var newContact = {
            id: Date.now().toString(),
            name: data.name,
            phone: data.phone,
            email: data.email,
            address: data.address,
            group: data.group,
            notes: data.notes,
            favorite: data.favorite,
            emergency: data.emergency,
            avatar: data.avatar,
            createdAt: new Date().toISOString()
        };
        
        contacts.push(newContact);
        saveContacts();
        modal.hide();
        
        Swal.fire({
            icon: 'success',
            title: 'Added!',
            text: 'Contact has been added successfully',
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
    }).then(function(result) {
        if (result.isConfirmed) {
            var newContacts = [];
            for (var i = 0; i < contacts.length; i++) {
                if (contacts[i].id !== id) {
                    newContacts.push(contacts[i]);
                }
            }
            contacts = newContacts;
            
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
    var contact = null;
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) {
            contact = contacts[i];
            break;
        }
    }
    
    if (contact) {
        openModal(contact);
    }
}

// Toggle Favorite Status
function toggleFavorite(id) {
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].id === id) {
            contacts[i].favorite = !contacts[i].favorite;
            saveContacts();
            renderContacts();
            updateStats();
            break;
        }
    }
}

// Handle Avatar Upload
function handleAvatarUpload(e) {
    var file = e.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var avatarPreview = document.getElementById('avatarPreview');
            avatarPreview.innerHTML = '<img src="' + event.target.result + '" alt="Avatar">';
            document.getElementById('avatarPath').value = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Get Initials from Name
function getInitials(name) {
    var parts = name.split(' ');
    var initials = '';
    for (var i = 0; i < parts.length && i < 2; i++) {
        if (parts[i] && parts[i][0]) {
            initials += parts[i][0].toUpperCase();
        }
    }
    return initials || 'NA';
}

// Render Contacts Grid
function renderContacts(contactsToRender) {
    if (!contactsToRender) {
        contactsToRender = contacts;
    }
    
    var contactsList = document.getElementById('contactsList');
    
    if (contactsToRender.length === 0) {
        contactsList.innerHTML = '<div class="col-12"><div class="empty-state"><div class="empty-icon"><i class="fas fa-address-book"></i></div><p class="text-muted fw-medium mb-1">No contacts found</p><p class="text-muted small">Click "Add Contact" to get started</p></div></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < contactsToRender.length; i++) {
        var contact = contactsToRender[i];
        
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

// Render Favorites Sidebar
function renderFavorites() {
    var favorites = [];
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].favorite) {
            favorites.push(contacts[i]);
        }
    }
    
    var favoritesList = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="text-center py-4"><p class="text-muted small mb-0">No favorites yet</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < favorites.length; i++) {
        var contact = favorites[i];
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

// Render Emergency Contacts Sidebar
function renderEmergency() {
    var emergency = [];
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].emergency) {
            emergency.push(contacts[i]);
        }
    }
    
    var emergencyList = document.getElementById('emergencyList');
    
    if (emergency.length === 0) {
        emergencyList.innerHTML = '<div class="text-center py-4"><p class="text-muted small mb-0">No emergency contacts</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < emergency.length; i++) {
        var contact = emergency[i];
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
    
    var searchTerm = query.toLowerCase();
    var filtered = [];
    
    for (var i = 0; i < contacts.length; i++) {
        var contact = contacts[i];
        var matchName = contact.name.toLowerCase().indexOf(searchTerm) !== -1;
        var matchPhone = contact.phone.indexOf(searchTerm) !== -1;
        var matchEmail = contact.email && contact.email.toLowerCase().indexOf(searchTerm) !== -1;
        
        if (matchName || matchPhone || matchEmail) {
            filtered.push(contact);
        }
    }
    
    renderContacts(filtered);
}

// Update Statistics
function updateStats() {
    var totalCount = contacts.length;
    var favoritesCount = 0;
    var emergencyCount = 0;
    
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].favorite) {
            favoritesCount++;
        }
        if (contacts[i].emergency) {
            emergencyCount++;
        }
    }
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('favoritesCount').textContent = favoritesCount;
    document.getElementById('emergencyCount').textContent = emergencyCount;
    document.getElementById('totalContactsText').textContent = totalCount;
}

// Initialize Application on Page Load
window.addEventListener('DOMContentLoaded', init);
