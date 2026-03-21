import React, { useEffect, useState } from 'react';
import { Header } from "../components/Header.tsx";
import { PageWithSideMenu } from "../components/PageWithSideMenu.tsx";
import { APIService, type Project } from "../services/apiService.ts";
import { Link } from "react-router-dom";

export const ProjectManagement: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newProject, setNewProject] = useState({ slug: '', name: '', description: '' });

    const fetchProjects = async () => {
        try {
            const data = await APIService.listProjects();
            setProjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await APIService.createProject(newProject.slug, newProject.name, newProject.description);
            setIsAdding(false);
            setNewProject({ slug: '', name: '', description: '' });
            fetchProjects();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await APIService.deleteProject(id);
                fetchProjects();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div>
            <Header strictAuth={true} />
            <PageWithSideMenu>
                <div className="page-content-view">
                    <div>
                        <h2 className="large-text">Projects</h2>
                        <button onClick={() => setIsAdding(!isAdding)}>
                            {isAdding ? 'Cancel' : 'Add Project'}
                        </button>
                    </div>

                    {isAdding && (
                        <div>
                            <h3>New Project</h3>
                            <form onSubmit={handleCreateProject} className="form-box">
                                <div className="form-input-container">
                                    <label>Slug:</label>
                                    <input
                                        type="text"
                                        value={newProject.slug}
                                        onChange={(e) => setNewProject({ ...newProject, slug: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-input-container">
                                    <label>Name:</label>
                                    <input
                                        type="text"
                                        value={newProject.name}
                                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-input-container">
                                    <label>Description:</label>
                                    <textarea
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    />
                                </div>
                                <button type="submit">Create</button>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <p>Loading projects...</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Slug</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => (
                                    <tr key={project.id}>
                                        <td>
                                            <Link to={`/admin/projects/${project.slug}/pages`}>{project.name}</Link>
                                        </td>
                                        <td>{project.slug}</td>
                                        <td>{project.description}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDeleteProject(project.id)}
                                            >
                                                Delete
                                            </button>
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
