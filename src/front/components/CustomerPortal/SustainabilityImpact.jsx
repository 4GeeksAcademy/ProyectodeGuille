import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Alert } from "react-bootstrap";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../../context/AuthContext.jsx';
import SustainabilityBadge from "./SustainabilityBadge";
import "./SustainabilityImpact.css";

const SustainabilityImpact = () => {
    const [impactData, setImpactData] = useState({
        products: [],
        totalImpact: {
            carbon: 0,
            water: 0,
            waste: 0,
            energy: 0,
        },
        categoryBreakdown: {},
    });
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchImpactData = async () => {
            if (!currentUser) return;

            try {
                const productsQuery = query(
                    collection(db, "products"),
                    where("userId", "==", currentUser.uid)
                );

                const querySnapshot = await getDocs(productsQuery);
                const products = [];
                const totalImpact = { carbon: 0, water: 0, waste: 0, energy: 0 };
                const categoryBreakdown = {};

                querySnapshot.forEach((doc) => {
                    const product = { id: doc.id, ...doc.data() };
                    products.push(product);

                    // Acumular impactos totales
                    totalImpact.carbon += product.carbonFootprintReduction || 0;
                    totalImpact.water += product.waterSaved || 0;
                    totalImpact.waste += product.wasteReduced || 0;
                    totalImpact.energy += product.energySaved || 0;

                    // Agrupar por categoría
                    const category = product.category || "Sin categoría";
                    if (!categoryBreakdown[category]) {
                        categoryBreakdown[category] = {
                            count: 0,
                            carbon: 0,
                            water: 0,
                            totalScore: 0,
                        };
                    }

                    categoryBreakdown[category].count++;
                    categoryBreakdown[category].carbon +=
                        product.carbonFootprintReduction || 0;
                    categoryBreakdown[category].water += product.waterSaved || 0;
                    categoryBreakdown[category].totalScore +=
                        product.sustainabilityScore || 0;
                });

                setImpactData({ products, totalImpact, categoryBreakdown });
            } catch (error) {
                console.error("Error fetching impact data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImpactData();
    }, [currentUser]);

    const getImpactLevel = (score) => {
        if (score >= 8) return { level: "Alto", variant: "success" };
        if (score >= 5) return { level: "Medio", variant: "warning" };
        return { level: "Bajo", variant: "danger" };
    };

    if (loading) {
        return (
            <div className="text-center">Cargando impacto de sostenibilidad...</div>
        );
    }

    return (
        <div className="sustainability-impact">
            <h2 className="impact-title">🌍 Impacto de Sostenibilidad</h2>

            {/* Resumen General */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="impact-summary-card">
                        <Card.Body className="text-center">
                            <div className="impact-icon">🌱</div>
                            <Card.Title>
                                {impactData.totalImpact.carbon.toFixed(1)} kg
                            </Card.Title>
                            <Card.Text>CO₂ Reducido</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="impact-summary-card">
                        <Card.Body className="text-center">
                            <div className="impact-icon">💧</div>
                            <Card.Title>{impactData.totalImpact.water} L</Card.Title>
                            <Card.Text>Agua Ahorrada</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="impact-summary-card">
                        <Card.Body className="text-center">
                            <div className="impact-icon">🗑️</div>
                            <Card.Title>{impactData.totalImpact.waste} kg</Card.Title>
                            <Card.Text>Residuos Reducidos</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="impact-summary-card">
                        <Card.Body className="text-center">
                            <div className="impact-icon">⚡</div>
                            <Card.Title>{impactData.totalImpact.energy} kWh</Card.Title>
                            <Card.Text>Energía Ahorrada</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Desglose por Categoría */}
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">📈 Desglose por Categoría</h5>
                </Card.Header>
                <Card.Body>
                    <Table responsive striped>
                        <thead>
                            <tr>
                                <th>Categoría</th>
                                <th>Productos</th>
                                <th>CO₂ Reducido (kg)</th>
                                <th>Agua Ahorrada (L)</th>
                                <th>Puntuación Promedio</th>
                                <th>Nivel de Impacto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(impactData.categoryBreakdown).map(
                                ([category, data]) => {
                                    const avgScore = data.totalScore / data.count;
                                    const impactLevel = getImpactLevel(avgScore);

                                    return (
                                        <tr key={category}>
                                            <td>{category}</td>
                                            <td>{data.count}</td>
                                            <td>{data.carbon.toFixed(1)}</td>
                                            <td>{data.water}</td>
                                            <td>
                                                <SustainabilityBadge score={avgScore} />
                                            </td>
                                            <td>
                                                <Alert
                                                    variant={impactLevel.variant}
                                                    className="py-1 mb-0"
                                                >
                                                    {impactLevel.level}
                                                </Alert>
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Productos con Mayor Impacto */}
            <Card>
                <Card.Header>
                    <h5 className="mb-0">🏆 Productos con Mayor Impacto</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        {impactData.products
                            .sort(
                                (a, b) =>
                                    (b.sustainabilityScore || 0) - (a.sustainabilityScore || 0)
                            )
                            .slice(0, 3)
                            .map((product) => (
                                <Col md={4} key={product.id} className="mb-3">
                                    <Card className="h-100">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Card.Title className="h6">{product.name}</Card.Title>
                                                <SustainabilityBadge
                                                    score={product.sustainabilityScore}
                                                />
                                            </div>
                                            <div className="impact-details">
                                                <small>
                                                    🌱 {product.carbonFootprintReduction || 0} kg CO₂
                                                </small>
                                                <br />
                                                <small>💧 {product.waterSaved || 0} L agua</small>
                                                <br />
                                                <small>⚡ {product.energySaved || 0} kWh energía</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default SustainabilityImpact;
