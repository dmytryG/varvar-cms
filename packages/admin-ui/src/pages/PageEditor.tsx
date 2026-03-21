import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "../components/Header.tsx";
import { APIService, type Page } from "../services/apiService.ts";
import {toast} from "react-toastify";

export const PageEditor: React.FC = () => {
    const { projectSlug, slug, language } = useParams<{ projectSlug: string, slug: string, language: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState<Page | null>(null);
    const [versions, setVersions] = useState<Page[]>([]);
    const [jsonData, setJsonData] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadSpecificPageVersion = async (_id: string) => {
        try {
            setLoading(true);
            const pageData = await APIService.getPageById(_id);

            setPage(pageData);
            setJsonData(JSON.stringify(pageData.data, null, 2));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchData = async () => {
        if (!projectSlug || !slug || !language) return;
        try {
            setLoading(true);
            const pageData = await APIService.getEditablePage(slug, language, projectSlug);
            const versionsData = await APIService.getPageVersions(slug, language, projectSlug);
            
            setPage(pageData);
            setVersions(versionsData);
            setJsonData(JSON.stringify(pageData.data, null, 2));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectSlug, slug, language]);

    const handleSave = async () => {
        if (!projectSlug || !slug || !language) return;
        try {
            setIsSaving(true);
            let parsedData;
            try {
                parsedData = JSON.parse(jsonData);
            } catch (e) {
                alert('Invalid JSON');
                return;
            }
            await APIService.updatePageData(slug, projectSlug, language, parsedData);
            await fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!projectSlug || !slug || !language) return;
        try {
            setIsSaving(true);
            await APIService.publishPage(slug, language, projectSlug);
            await fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div>Loading editor...</div>;
    if (!page) return <div>Page not found</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#15173D', color: '#F1E9E9' }}>
            <Header strictAuth={true} />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left side: Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', borderRight: '1px solid #E491C9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h3 className="large-text">Editing: {slug} ({language})</h3>
                        <div className="horizontal-lineral-container">
                            <button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button onClick={handlePublish} disabled={isSaving} className="red-background">
                                {isSaving ? 'Publishing...' : 'Publish'}
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={jsonData}
                        onChange={(e) => setJsonData(e.target.value)}
                        style={{
                            flex: 1,
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            padding: '10px',
                            border: '1px solid #E491C9',
                            borderRadius: '5px',
                            resize: 'none',
                            backgroundColor: '#242650',
                            color: '#F1E9E9'
                        }}
                    />
                </div>

                {/* Right side: Versions and Languages */}
                <div style={{ width: '300px', padding: '20px', backgroundColor: '#242650', overflowY: 'auto', borderLeft: '1px solid #E491C9' }}>
                    <h4 className="large-text" style={{ fontSize: '1.2rem' }}>Languages</h4>
                    <div style={{ marginBottom: '20px' }}>
                        {/* Simplified language switcher/creator */}
                        <div className="horizontal-lineral-container" style={{ flexWrap: 'wrap' }}>
                             <button 
                                onClick={() => navigate(`/admin/projects/${projectSlug}/pages/${slug}/en`)}
                                style={{ borderColor: language === 'en' ? '#F1E9E9' : '#E491C9' }}
                             >en</button>
                             <button 
                                onClick={() => {
                                    const newLang = prompt('Enter new language code:');
                                    if (newLang) navigate(`/admin/projects/${projectSlug}/pages/${slug}/${newLang}`);
                                }}
                             >+</button>
                        </div>
                    </div>

                    <h4 className="large-text" style={{ fontSize: '1.2rem' }}>Versions</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {versions.map((v) => (
                            <li key={v._id} style={{
                                padding: '10px', 
                                borderBottom: '1px solid #E491C9',
                                backgroundColor: v._id === page._id ? '#15173D' : 'transparent'
                            }}>
                                <div>Version {v._id} {v.isPublished && <strong style={{ color: '#91e4bf' }}>(Published)</strong>} {v.isRoot && <strong style={{ color: '#91e4bf' }}>(Root)</strong>}</div>
                                <div style={{ fontSize: '12px', color: '#ccc' }}>{new Date(v.createdAt).toLocaleString()}</div>
                                {v._id !== page._id && (
                                    <button 
                                        onClick={async () => {
                                            await loadSpecificPageVersion(v._id);
                                            toast('Data loaded from version ' + v._id + '. You can now save it as a new draft.');
                                        }}
                                        style={{ fontSize: '11px', marginTop: '5px', padding: '5px' }}
                                    >
                                        Load Data
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
