import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from "../components/Header.tsx";
import { PageWithSideMenu } from "../components/PageWithSideMenu.tsx";
import { APIService, type Page } from "../services/apiService.ts";

export const PageManagement: React.FC = () => {
    const { projectSlug } = useParams<{ projectSlug: string }>();
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newPage, setNewPage] = useState({ slug: '', language: 'en', data: '{}' });

    const fetchPages = async () => {
        if (!projectSlug) return;
        try {
            const data = await APIService.listProjectPages(projectSlug);
            setPages(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, [projectSlug]);

    const handleCreatePage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectSlug) return;
        try {
            let parsedData = {};
            try {
                parsedData = JSON.parse(newPage.data);
            } catch (e) {
                alert('Invalid JSON data');
                return;
            }
            await APIService.createPage(newPage.slug, newPage.language, projectSlug, parsedData);
            setIsAdding(false);
            setNewPage({ slug: '', language: 'en', data: '{}' });
            fetchPages();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <Header strictAuth={true} />
            <PageWithSideMenu>
                <div className="page-content-view">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 className="large-text">Pages for Project: {projectSlug}</h2>
                        <button onClick={() => setIsAdding(!isAdding)}>
                            {isAdding ? 'Cancel' : 'Add Page'}
                        </button>
                    </div>

                    {isAdding && (
                        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #E491C9', borderRadius: '5px' }}>
                            <h3>New Page</h3>
                            <form onSubmit={handleCreatePage} className="form-box">
                                <div className="form-input-container">
                                    <label>Slug:</label>
                                    <input
                                        type="text"
                                        value={newPage.slug}
                                        onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-input-container">
                                    <label>Language Code:</label>
                                    <input
                                        type="text"
                                        value={newPage.language}
                                        onChange={(e) => setNewPage({ ...newPage, language: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-input-container">
                                    <label>Initial Data (JSON):</label>
                                    <textarea
                                        value={newPage.data}
                                        onChange={(e) => setNewPage({ ...newPage, data: e.target.value })}
                                        style={{ backgroundColor: '#15173D', color: '#F1E9E9', border: '1px solid #E491C9', borderRadius: '5px', padding: '10px', height: '100px', fontFamily: 'monospace' }}
                                    />
                                </div>
                                <button type="submit">Create</button>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <p>Loading pages...</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Slug</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Language</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Version</th>
                                    <th style={{ textAlign: 'right', padding: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.filter(p => p.isRoot).map((page) => (
                                    <tr key={page._id}>
                                        <td style={{ padding: '10px' }}>
                                            <Link to={`/admin/projects/${projectSlug}/pages/${page.slug}/${page.language}`}>
                                                {page.slug}
                                            </Link>
                                        </td>
                                        <td style={{ padding: '10px' }}>{page.language}</td>
                                        <td style={{ padding: '10px' }}>
                                            {page.isPublished ? <span style={{ color: '#91e4bf' }}>Published</span> : <span style={{ color: 'gray' }}>Draft</span>}
                                        </td>
                                        <td style={{ padding: '10px' }}>{page._id}</td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>
                                            <Link to={`/admin/projects/${projectSlug}/pages/${page.slug}/${page.language}`}>
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </PageWithSideMenu>
        </div>
    );
};
