import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { trpc } from '../utils/trpc';
import { toast } from 'sonner';
export function MegaTournamentCreator() {
    const [megaTournamentName, setMegaTournamentName] = useState('');
    const [date, setDate] = useState('');
    const [subTournaments, setSubTournaments] = useState([
        { name: 'Beer Pong Championship', format: 'single_elimination', maxTeams: 16 },
        { name: 'Beer Die Tournament', format: 'double_elimination', maxTeams: 8 },
        { name: 'Flip Cup League', format: 'round_robin', maxTeams: 12 }
    ]);
    const [bonusChallenges, setBonusChallenges] = useState([
        { name: 'Karaoke Champion', description: 'Perform a crowd-favorite song', points: 50, type: 'individual' },
        { name: 'Best Team Spirit', description: 'Show amazing team enthusiasm', points: 75, type: 'team' },
        { name: 'Social Media Star', description: 'Post the best tournament photo/video', points: 25, type: 'individual' }
    ]);
    const [editingSubIndex, setEditingSubIndex] = useState(null);
    const [editingBonusIndex, setEditingBonusIndex] = useState(null);
    const createMegaTournament = trpc.tournament.createMegaTournament.useMutation({
        onSuccess: (data) => {
            toast.success('Mega tournament created successfully!');
            console.log('Created mega tournament:', data);
        },
        onError: (error) => {
            toast.error(`Failed to create mega tournament: ${error.message}`);
        }
    });
    // Sub-tournament management functions
    const addSubTournament = () => {
        setSubTournaments([...subTournaments, {
                name: 'New Tournament',
                format: 'single_elimination',
                maxTeams: 16
            }]);
    };
    const updateSubTournament = (index, updates) => {
        const updated = [...subTournaments];
        updated[index] = { ...updated[index], ...updates };
        setSubTournaments(updated);
    };
    const deleteSubTournament = (index) => {
        setSubTournaments(subTournaments.filter((_, i) => i !== index));
    };
    // Bonus challenge management functions
    const addBonusChallenge = () => {
        setBonusChallenges([...bonusChallenges, {
                name: 'New Challenge',
                description: 'Description',
                points: 25,
                type: 'individual'
            }]);
    };
    const updateBonusChallenge = (index, updates) => {
        const updated = [...bonusChallenges];
        updated[index] = { ...updated[index], ...updates };
        setBonusChallenges(updated);
    };
    const deleteBonusChallenge = (index) => {
        setBonusChallenges(bonusChallenges.filter((_, i) => i !== index));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!megaTournamentName || !date) {
            toast.error('Please fill in all required fields');
            return;
        }
        createMegaTournament.mutate({
            name: megaTournamentName,
            date,
            subTournaments: subTournaments.map(st => ({
                name: st.name,
                format: st.format,
                maxTeams: st.maxTeams,
                pointsForPlacement: { 1: 100, 2: 75, 3: 50, 4: 25 }
            })),
            bonusChallenges: bonusChallenges.map((bc, index) => ({
                id: `bonus-${index}`,
                name: bc.name,
                description: bc.description,
                points: bc.points,
                type: bc.type,
                maxCompletions: 1,
                requirements: []
            })),
            megaScoringMethod: 'placement'
        });
    };
    return (_jsxs(Card, { className: "p-6 max-w-4xl mx-auto", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Create Mega Tournament" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Create a mega tournament that spans multiple games with overall scoring and bonus challenges!" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Mega Tournament Name" }), _jsx(Input, { value: megaTournamentName, onChange: (e) => setMegaTournamentName(e.target.value), placeholder: "Summer Beer Olympics 2024", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Date" }), _jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value), required: true })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Sub-Tournaments" }), _jsx(Button, { type: "button", size: "sm", onClick: addSubTournament, children: "Add Tournament" })] }), _jsx("div", { className: "space-y-3", children: subTournaments.map((st, index) => (_jsx(Card, { className: "p-4 bg-gray-50", children: editingSubIndex === index ? (_jsxs("div", { className: "space-y-3", children: [_jsx(Input, { value: st.name, onChange: (e) => updateSubTournament(index, { name: e.target.value }), placeholder: "Tournament name" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("select", { className: "w-full px-3 py-2 border rounded-md", value: st.format, onChange: (e) => updateSubTournament(index, { format: e.target.value }), children: [_jsx("option", { value: "single_elimination", children: "Single Elimination" }), _jsx("option", { value: "double_elimination", children: "Double Elimination" }), _jsx("option", { value: "round_robin", children: "Round Robin" })] }), _jsx(Input, { type: "number", value: st.maxTeams, onChange: (e) => updateSubTournament(index, { maxTeams: parseInt(e.target.value) }), min: "2", max: "128", placeholder: "Max teams" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", size: "sm", onClick: () => setEditingSubIndex(null), children: "Save" }), _jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => deleteSubTournament(index), children: "Delete" })] })] })) : (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: st.name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Format: ", st.format.replace('_', ' '), " | Max Teams: ", st.maxTeams] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Points: 1st: 100 | 2nd: 75 | 3rd: 50 | 4th: 25" }), _jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => setEditingSubIndex(index), children: "Edit" })] })] })) }, index))) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Bonus Challenges" }), _jsx(Button, { type: "button", size: "sm", onClick: addBonusChallenge, children: "Add Challenge" })] }), _jsx("div", { className: "space-y-3", children: bonusChallenges.map((bc, index) => (_jsx(Card, { className: "p-4 bg-blue-50", children: editingBonusIndex === index ? (_jsxs("div", { className: "space-y-3", children: [_jsx(Input, { value: bc.name, onChange: (e) => updateBonusChallenge(index, { name: e.target.value }), placeholder: "Challenge name" }), _jsx(Input, { value: bc.description, onChange: (e) => updateBonusChallenge(index, { description: e.target.value }), placeholder: "Description" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { type: "number", value: bc.points, onChange: (e) => updateBonusChallenge(index, { points: parseInt(e.target.value) }), min: "5", max: "200", placeholder: "Points" }), _jsxs("select", { className: "w-full px-3 py-2 border rounded-md", value: bc.type, onChange: (e) => updateBonusChallenge(index, { type: e.target.value }), children: [_jsx("option", { value: "individual", children: "Individual" }), _jsx("option", { value: "team", children: "Team" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", size: "sm", onClick: () => setEditingBonusIndex(null), children: "Save" }), _jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => deleteBonusChallenge(index), children: "Delete" })] })] })) : (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx("h4", { className: "font-medium", children: bc.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm font-semibold text-blue-600", children: ["+", bc.points, " pts"] }), _jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => setEditingBonusIndex(index), children: "Edit" })] })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: bc.description }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Type: ", bc.type] })] })) }, index))) })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: createMegaTournament.isPending, children: createMegaTournament.isPending ? 'Creating...' : 'Create Mega Tournament' })] })] }));
}
