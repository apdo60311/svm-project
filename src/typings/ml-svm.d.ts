// typings/ml-svm.d.ts
declare module 'libsvm-js' {
    export interface SVMOptions {
        C?: number;
        tol?: number;
        maxPasses?: number;
        maxIterations?: number;
        kernel?: 'linear' | 'rbf' | 'polynomial' | 'sigmoid' | 'precomputed';
        kernelOptions?: { sigma?: number; degree?: number; coef0?: number };
    }

    export default class SVM {
        constructor(options?: SVMOptions);
        train(features: number[][], labels: number[]): void;
        predict(features: number[][]): number[];
        margin(features: number[][]): number[];
        supportVectors(): number[][];
        toJSON(): object;
        static load(model: object): SVM;
    }
}
