import React, { useState, useEffect } from "react";
import { Card, Row, Col, ProgressBar, Badge } from "react-bootstrap";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../../context/AuthContext.jsx';
import "./RealTimeMetrics.css";

const RealTimeMetrics = () => {
    const [metrics, setMetrics] = useState({
        totalProducts: 0,
        ecoFriendlyProducts: 0,
        carbonFootprintReduction: 0,
        waterSaved: 0,
        treesPlanted: 0,
    });
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        // Suscribirse a productos del usuario en tiempo real
        const productsQuery = query(
            collection(db, "products"),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
            let total = 0;
            let ecoFriendly = 0;
            let totalCarbonReduction = 0;
            let totalWaterSaved = 0;
            let totalTreesPlanted = 0;

            snapshot.forEach((doc) => {
                const product = doc.data();
                total++;

                if (product.sustainabilityScore >= 7) {
                    ecoFriendly++;
                }

                // Calcular métricas acumuladas
                totalCarbonReduction += product.carbonFootprintReduction || 0;
                totalWaterSaved += product.waterSaved || 0;
                totalTreesPlanted += product.treesPlanted || 0;
            });

            setMetrics({
                totalProducts: total,
                ecoFriendlyProducts: ecoFriendly,
                carbonFootprintReduction: totalCarbonReduction,
                waterSaved: totalWaterSaved,
                treesPlanted: totalTreesPlanted,
            });
        });

        return () => unsubscribe();
    }, [currentUser]);

    const ecoPercentage =
        metrics.totalProducts > 0
            ? Math.round((metrics.ecoFriendlyProducts / metrics.totalProducts) * 100)
            : 0;

    return (
        <div className="real-time-metrics">
            <h3 className="metrics-title">📊 Métricas en Tiempo Real</h3>

            <Row className="g-3">
                {/* Porcentaje de Productos Eco-friendly */}
                <Col md={6}>
                    <Card className="metric-card h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="metric-title">
                                    Eco-amigabilidad
                                </Card.Title>
                                <Badge
                                    bg={
                                        ecoPercentage >= 70
                                            ? "success"
                                            : ecoPercentage >= 40
                                                ? "warning"
                                                : "danger"
                                    }
                                >
                                    {ecoPercentage}%
                                </Badge>
                            </div>
                            <ProgressBar
                                now={ecoPercentage}
                                variant={
                                    ecoPercentage >= 70
                                        ? "success"
                                        : ecoPercentage >= 40
                                            ? "warning"
                                            : "danger"
                                }
                                className="metric-progress"
                            />
                            <div className="metric-detail mt-2">
                                {metrics.ecoFriendlyProducts} de {metrics.totalProducts}{" "}
                                productos son eco-friendly
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Reducción de Huella de Carbono */}
                <Col md={6}>
                    <Card className="metric-card h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                                <span className="metric-icon">🌱</span>
                                <Card.Title className="metric-title ms-2">
                                    Carbono Reducido
                                </Card.Title>
                            </div>
                            <div className="metric-value">
                                {metrics.carbonFootprintReduction} kg CO₂
                            </div>
                            <div className="metric-subtitle">
                                Equivale a {Math.round(metrics.carbonFootprintReduction / 21)}{" "}
                                días de energía de un hogar
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Agua Ahorrada */}
                <Col md={6}>
                    <Card className="metric-card h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                                <span className="metric-icon">💧</span>
                                <Card.Title className="metric-title ms-2">
                                    Agua Ahorrada
                                </Card.Title>
                            </div>
                            <div className="metric-value">{metrics.waterSaved} L</div>
                            <div className="metric-subtitle">
                                Equivale a {Math.round(metrics.waterSaved / 150)} duchas de 10
                                minutos
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Árboles Plantados */}
                <Col md={6}>
                    <Card className="metric-card h-100">
                        <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                                <span className="metric-icon">🌳</span>
                                <Card.Title className="metric-title ms-2">
                                    Árboles Equivalentes
                                </Card.Title>
                            </div>
                            <div className="metric-value">{metrics.treesPlanted}</div>
                            <div className="metric-subtitle">
                                Capacidad de absorción de {metrics.treesPlanted * 21} kg CO₂/año
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default RealTimeMetrics;
