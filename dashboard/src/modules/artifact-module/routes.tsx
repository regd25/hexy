/**
 * Artifact Module Routes Configuration
 * Defines all routes for the artifact management module
 */

import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ArtifactDashboard } from './pages/ArtifactDashboard';

/**
 * Artifact module route configuration
 */
export const artifactRoutes: RouteObject = {
  path: '/artifacts',
  children: [
    {
      index: true,
      element: <ArtifactDashboard />
    },
    {
      path: 'create',
      element: <ArtifactDashboard />
    },
    {
      path: ':id/edit',
      element: <ArtifactDashboard />
    },
    {
      path: ':id',
      element: <ArtifactDashboard />
    }
  ]
};

/**
 * Navigation items for the artifact module
 */
export const artifactNavigation = {
  name: 'Artifacts',
  path: '/artifacts',
  icon: 'M19 14l-7 7m0 0l-7-7m7 7V3',
  description: 'Manage and visualize Hexy artifacts'
};

export default artifactRoutes;