import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Header} from "../components/Header.tsx";
import {APIService, type Page} from "../services/apiService.ts";
import {toast} from "react-toastify";
import {SideMenu} from "../components/SideMenu.tsx";
import {PageWithSideMenu} from "../components/PageWithSideMenu.tsx";

export const PageEditor: React.FC = () => {
    const {projectSlug, slug, language} = useParams<{ projectSlug: string, slug: string, language: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState<Page | null>(null);
    const [versions, setVersions] = useState<Page[]>([]);
    const [jsonData, setJsonData] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [languages, setLanguages] = useState<string[]>([]);

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
            const pagesData = await APIService.listProjectPages(projectSlug);
            const languagesData = pagesData.filter(p => p.slug === slug && p.isRoot).map(p => p.language);

            setPage(pageData);
            setVersions(versionsData);
            setLanguages(languagesData);
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
        <div>
            <Header strictAuth={true}/>
            <PageWithSideMenu>
                <div>
                    {/* Left side: Editor */}
                    <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
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
                        />
                    </div>

                    {/* Right side: Versions and Languages */}
                    <div>
                        <h4>Languages</h4>
                        <div>
                            {/* Simplified language switcher/creator */}
                            <div className="horizontal-lineral-container">
                                {languages.map((lang) => (
                                    <button
                                        onClick={() => navigate(`/admin/projects/${projectSlug}/pages/${slug}/${lang}`)}
                                        disabled={language === lang}
                                    >{lang}</button>
                                ))}

                                <button
                                    onClick={async () => {
                                        const newLang = prompt('Enter new language code:');
                                        if (!newLang) toast.error('Language code is required');
                                        await APIService.createPage(slug, newLang, projectSlug, {});
                                        navigate(`/admin/projects/${projectSlug}/pages/${slug}/${newLang}`);
                                    }}
                                >+
                                </button>
                            </div>
                        </div>

                        <h4 className="large-text">Versions</h4>
                        <ul>
                            {versions.map((v) => (
                                <li key={v._id}>
                                    <div>Version {v._id} {v.isPublished &&
                                        <strong>(Published)</strong>} {v.isRoot &&
                                        <strong>(Root)</strong>}</div>
                                    <div>{new Date(v.createdAt).toLocaleString()}</div>
                                    {v._id !== page._id && (
                                        <button
                                            onClick={async () => {
                                                await loadSpecificPageVersion(v._id);
                                                toast('Data loaded from version ' + v._id + '. You can now save it as a new draft.');
                                            }}
                                        >
                                            Load Data
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </PageWithSideMenu>
        </div>
    );
};
