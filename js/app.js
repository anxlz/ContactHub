// ContactHub Application
class ContactHub {
    constructor() {
        this.contacts = this.loadFromLocalStorage();
        this.currentEditId = null;
        this.modal = new bootstrap.Modal(document.getElementById('contactModal'));
        this.init();
    }

    init() {
        this.renderContacts();
        this.updateStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add Contact Button
        document.getElementById('addContactBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Form Submit
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContact();
        });

        // Search Input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchContacts(e.target.value);
        });

        // Avatar Upload
        document.getElementById('avatarInput').addEventListener('change', (e) => {
            this.handleAvatarUpload(e);
        });

        // Reset form when modal closes
        document.getElementById('contactModal').addEventListener('hidden.bs.modal', () => {
            this.resetForm();
        });
    }

    loadFromLocalStorage() {
        const contacts = localStorage.getItem('contacts');
        return contacts ? JSON.parse(contacts) : [];
    }

    saveToLocalStorage() {
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
    }

    openModal(contact = null) {
        if (contact) {
            // Edit mode
            this.currentEditId = contact.id;
            document.getElementById('modalTitle').textContent = 'Edit Contact';
            this.populateForm(contact);
        } else {
            // Add mode
            this.currentEditId = null;
            document.getElementById('modalTitle').textContent = 'Add New Contact';
            this.resetForm();
        }
        this.modal.show();
    }

    populateForm(contact) {
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

        // Set avatar preview
        const avatarPreview = document.getElementById('avatarPreview');
        if (contact.avatar) {
            avatarPreview.innerHTML = `<img src="${contact.avatar}" alt="${contact.name}">`;
        } else {
            const initials = this.getInitials(contact.name);
            avatarPreview.innerHTML = initials;
        }
    }

    resetForm() {
        document.getElementById('contactForm').reset();
        document.getElementById('contactId').value = '';
        document.getElementById('avatarPath').value = '';
        document.getElementById('avatarPreview').innerHTML = '<i class="fas fa-user"></i>';
        
        // Remove validation classes
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
        
        this.currentEditId = null;
    }

    validateForm(data) {
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

        // Phone validation (Egyptian format)
        const phoneRegex = /^(010|011|012|015)\d{8}$/;
        const phoneInput = document.getElementById('contactPhone');
        if (!phoneRegex.test(data.phone)) {
            phoneInput.classList.add('is-invalid');
            isValid = false;
        } else {
            phoneInput.classList.remove('is-invalid');
        }

        // Email validation (if provided)
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

    saveContact() {
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

        if (!this.validateForm(data)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please check the form for errors',
                confirmButtonColor: '#7c3aed'
            });
            return;
        }

        if (this.currentEditId) {
            // Update existing contact
            const index = this.contacts.findIndex(c => c.id === this.currentEditId);
            if (index !== -1) {
                this.contacts[index] = { ...this.contacts[index], ...data };
                this.saveToLocalStorage();
                this.modal.hide();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Contact has been updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } else {
            // Add new contact
            const newContact = {
                id: Date.now().toString(),
                ...data,
                createdAt: new Date().toISOString()
            };
            this.contacts.push(newContact);
            this.saveToLocalStorage();
            this.modal.hide();
            
            Swal.fire({
                icon: 'success',
                title: 'Added!',
                text: 'Contact has been added successfully',
                timer: 2000,
                showConfirmButton: false
            });
        }

        this.renderContacts();
        this.updateStats();
    }

    deleteContact(id) {
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
                this.contacts = this.contacts.filter(c => c.id !== id);
                this.saveToLocalStorage();
                this.renderContacts();
                this.updateStats();
                
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

    toggleFavorite(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            contact.favorite = !contact.favorite;
            this.saveToLocalStorage();
            this.renderContacts();
            this.updateStats();
        }
    }

    handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarPreview = document.getElementById('avatarPreview');
                avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
                document.getElementById('avatarPath').value = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    getInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    renderContacts(contacts = this.contacts) {
        const contactsList = document.getElementById('contactsList');
        
        if (contacts.length === 0) {
            contactsList.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-address-book"></i>
                        </div>
                        <p class="text-muted fw-medium mb-1">No contacts found</p>
                        <p class="text-muted small">Click "Add Contact" to get started</p>
                    </div>
                </div>
            `;
            return;
        }

        contactsList.innerHTML = contacts.map(contact => `
            <div class="col-12 col-md-6">
                <div class="contact-card">
                    <div class="d-flex align-items-start gap-3">
                        ${contact.avatar ? 
                            `<img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar">` :
                            `<div class="contact-avatar-placeholder">${this.getInitials(contact.name)}</div>`
                        }
                        <div class="flex-grow-1 min-w-0">
                            <div class="d-flex align-items-start justify-content-between mb-2">
                                <div class="flex-grow-1 min-w-0">
                                    <h3 class="mb-1 fw-bold fs-6">${contact.name}</h3>
                                    ${contact.group ? `<span class="badge badge-${contact.group}">${contact.group}</span>` : ''}
                                </div>
                                <button class="btn btn-sm btn-favorite ${contact.favorite ? 'active' : ''}" onclick="app.toggleFavorite('${contact.id}')">
                                    <i class="fas fa-star"></i>
                                </button>
                            </div>
                            <div class="mb-2 small">
                                <div class="d-flex align-items-center gap-2 mb-1 text-muted">
                                    <i class="fas fa-phone" style="width: 14px;"></i>
                                    <span>${contact.phone}</span>
                                </div>
                                ${contact.email ? `
                                <div class="d-flex align-items-center gap-2 text-muted">
                                    <i class="fas fa-envelope" style="width: 14px;"></i>
                                    <span class="text-truncate">${contact.email}</span>
                                </div>
                                ` : ''}
                            </div>
                            <div class="d-flex gap-2">
                                <a href="tel:${contact.phone}" class="action-btn btn-call" title="Call">
                                    <i class="fas fa-phone"></i>
                                </a>
                                ${contact.email ? `
                                <a href="mailto:${contact.email}" class="action-btn btn-email" title="Email">
                                    <i class="fas fa-envelope"></i>
                                </a>
                                ` : ''}
                                <button class="action-btn btn-edit" onclick="app.editContact('${contact.id}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn btn-delete" onclick="app.deleteContact('${contact.id}')" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        this.renderFavorites();
        this.renderEmergency();
    }

    renderFavorites() {
        const favorites = this.contacts.filter(c => c.favorite);
        const favoritesList = document.getElementById('favoritesList');
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-muted small mb-0">No favorites yet</p>
                </div>
            `;
            return;
        }

        favoritesList.innerHTML = favorites.map(contact => `
            <div class="favorite-item" onclick="app.editContact('${contact.id}')">
                ${contact.avatar ? 
                    `<img src="${contact.avatar}" alt="${contact.name}" class="favorite-avatar">` :
                    `<div class="favorite-avatar contact-avatar-placeholder" style="width: 40px; height: 40px; font-size: 16px;">${this.getInitials(contact.name)}</div>`
                }
                <div class="flex-grow-1 min-w-0">
                    <p class="mb-0 fw-semibold small text-truncate">${contact.name}</p>
                    <p class="mb-0 text-muted" style="font-size: 12px;">${contact.phone}</p>
                </div>
            </div>
        `).join('');
    }

    renderEmergency() {
        const emergency = this.contacts.filter(c => c.emergency);
        const emergencyList = document.getElementById('emergencyList');
        
        if (emergency.length === 0) {
            emergencyList.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-muted small mb-0">No emergency contacts</p>
                </div>
            `;
            return;
        }

        emergencyList.innerHTML = emergency.map(contact => `
            <div class="favorite-item" onclick="app.editContact('${contact.id}')">
                ${contact.avatar ? 
                    `<img src="${contact.avatar}" alt="${contact.name}" class="favorite-avatar">` :
                    `<div class="favorite-avatar contact-avatar-placeholder" style="width: 40px; height: 40px; font-size: 16px;">${this.getInitials(contact.name)}</div>`
                }
                <div class="flex-grow-1 min-w-0">
                    <p class="mb-0 fw-semibold small text-truncate">${contact.name}</p>
                    <p class="mb-0 text-muted" style="font-size: 12px;">${contact.phone}</p>
                </div>
            </div>
        `).join('');
    }

    editContact(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            this.openModal(contact);
        }
    }

    searchContacts(query) {
        if (!query.trim()) {
            this.renderContacts();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = this.contacts.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.phone.includes(searchTerm) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm))
        );

        this.renderContacts(filtered);
    }

    updateStats() {
        const totalCount = this.contacts.length;
        const favoritesCount = this.contacts.filter(c => c.favorite).length;
        const emergencyCount = this.contacts.filter(c => c.emergency).length;

        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('favoritesCount').textContent = favoritesCount;
        document.getElementById('emergencyCount').textContent = emergencyCount;
        document.getElementById('totalContactsText').textContent = totalCount;
    }
}

// Initialize the app
const app = new ContactHub();