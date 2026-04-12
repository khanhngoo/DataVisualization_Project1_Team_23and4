import { useState, useEffect } from 'react';

export interface PenguinData {
    species: 'Adelie' | 'Chinstrap' | 'Gentoo';
    island: 'Torgersen' | 'Biscoe' | 'Dream';
    bill_length_mm: number;
    bill_depth_mm: number;
    flipper_length_mm: number;
    body_mass_g: number;
    sex: 'Male' | 'Female';
    PC1: number;
    PC2: number;
    PC3: number;
    cluster_k3: number;
}

export interface KMeansValidation {
    k_range: number[];
    inertias: number[];
    silhouettes: number[];
    ari_scores: number[];
}

export function usePenguinData() {
    const [data, setData] = useState<PenguinData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch('/data/penguins_pca.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch data');
                return res.json();
            })
            .then((jsonData) => {
                setData(jsonData);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, []);

    return { data, loading, error };
}

export function useKMeansValidation() {
    const [validation, setValidation] = useState<KMeansValidation | null>(null);
    useEffect(() => {
        fetch('/data/kmeans_validation.json')
            .then(res => res.json())
            .then(setValidation)
            .catch(() => { });
    }, []);
    return validation;
}

export function useKMeansClusters() {
    const [clusters, setClusters] = useState<Record<string, number[]> | null>(null);
    useEffect(() => {
        fetch('/data/kmeans_clusters.json')
            .then(res => res.json())
            .then(setClusters)
            .catch(() => { });
    }, []);
    return clusters;
}
