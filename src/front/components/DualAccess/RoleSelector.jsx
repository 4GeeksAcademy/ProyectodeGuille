import React from 'react';

const RoleSelector = ({ selectedRole, onRoleChange }) => {
    const roles = [
        {
            value: 'customer',
            label: 'Cliente',
            icon: '👤',
            description: 'Comprar y personalizar productos de lujo sostenible',
            features: [
                'Personalización de productos',
                'Seguimiento de cotizaciones',
                'Historial de pedidos'
            ]
        },
        {
            value: 'business',
            label: 'Empresa',
            icon: '🏢',
            description: 'Gestionar productos y analizar ventas',
            features: [
                'Dashboard de analytics',
                'Gestión de inventario',
                'Seguimiento de cotizaciones'
            ]
        }
    ];

    return (
        <div className="role-selector">
            <h3 className="role-selector-title">Selecciona tu tipo de cuenta</h3>
            <p className="role-selector-subtitle">
                Elige cómo quieres usar EcoLuxury Craft
            </p>

            <div className="roles-grid">
                {roles.map(role => (
                    <div
                        key={role.value}
                        className={`role-card ${selectedRole === role.value ? 'selected' : ''}`}
                        onClick={() => onRoleChange(role.value)}
                    >
                        <div className="role-header">
                            <div className="role-icon">{role.icon}</div>
                            <div className="role-info">
                                <h4 className="role-label">{role.label}</h4>
                                <p className="role-description">{role.description}</p>
                            </div>
                            <div className="role-radio">
                                <div className={`radio-dot ${selectedRole === role.value ? 'active' : ''}`} />
                            </div>
                        </div>

                        <div className="role-features">
                            <ul>
                                {role.features.map((feature, index) => (
                                    <li key={index} className="feature-item">
                                        <span className="check-icon">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoleSelector;