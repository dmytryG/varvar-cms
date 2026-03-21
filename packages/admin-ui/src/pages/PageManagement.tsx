import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from "../components/Header.tsx";
import { PageWithSideMenu } from "../components/PageWithSideMenu.tsx";
import { APIService, type Page } from "../services/apiService.ts";

export type PageItemDto = {
    page: Page;
    pages: Page[];
}

export const PageManagement: React.FC = () => {
    const { projectSlug } = useParams<{ projectSlug: string }>();
    const [pages, setPages] = useState<PageItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newPage, setNewPage] = useState({ slug: '', language: 'en', data: '{}' });

    const fetchPages = async () => {
        if (!projectSlug) return;
        try {
            const data = await APIService.listProjectPages(projectSlug);
            const pagesMap = new Map<string, PageItemDto>();
            for (const page of data) {
                if (!page.isRoot) continue;
                const existingPage = pagesMap.get(page.slug);
                if (!existingPage) {
                    pagesMap.set(page.slug, { page, pages: [page] });
                } else {
                    pagesMap.set(page.slug, { page, pages: [...existingPage.pages, page] });
                }
            }
            setPages(Array.from(pagesMap.values()));
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
                    <div>
                        <h2 className="large-text">Pages for Project: {projectSlug}</h2>
                        <button onClick={() => setIsAdding(!isAdding)}>
                            {isAdding ? 'Cancel' : 'Add Page'}
                        </button>
                    </div>

                    {isAdding && (
                        <div>
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
                                    />
                                </div>
                                <button type="submit">Create</button>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <p>Loading pages...</p>
                    ) : (
                        <div>
                            {pages.map((page) => (
                                <div>
                                    <span>{page.page.slug}</span>
                                    <table key={page.page._id}>
                                        <thead>
                                            <tr>
                                                <th>Language</th>
                                                <th>Actions</th>
                                                <th>Created at</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {page.pages.map((p) => (
                                            <tr key={p._id}>
                                                <td>{p.language}</td>
                                                <td>
                                                    <Link to={`/admin/projects/${projectSlug}/pages/${p.slug}/${p.language}`}>Edit</Link>
                                                </td>
                                                <td>{new Date(p.createdAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PageWithSideMenu>
        </div>
    );
};
