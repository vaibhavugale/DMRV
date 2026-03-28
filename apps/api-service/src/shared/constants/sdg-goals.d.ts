export interface SDGGoal {
    id: number;
    name: string;
    description: string;
    relevantToAgroforestry: boolean;
    indicators: string[];
}
export declare const SDG_GOALS: SDGGoal[];
export declare function getAgroforestryRelevantSDGs(): SDGGoal[];
//# sourceMappingURL=sdg-goals.d.ts.map