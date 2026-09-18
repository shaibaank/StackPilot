import { useContext } from "react";
import { ProjectContext } from "../project.context";


export function useProject() {
    const context = useContext(ProjectContext)
    return context
}
