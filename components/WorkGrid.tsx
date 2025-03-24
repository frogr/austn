import { FC } from 'react';
import WorkCard, { WorkCardProps } from './WorkCard';

interface WorkGridProps {
  projects: WorkCardProps[];
}

const WorkGrid: FC<WorkGridProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {projects.map((project) => (
        <WorkCard
          key={project.id}
          id={project.id}
          title={project.title}
          description={project.description}
          tags={project.tags}
          image={project.image}
        />
      ))}
      {projects.length === 0 && (
        <div className="col-span-full text-center p-12">
          <p className="text-gray-500">No projects available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default WorkGrid;