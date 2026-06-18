"""
Motor principal de orquestación contextual de Hexy Framework.
Coordina la selección, compresión y explicación de contexto.
"""
import asyncio
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import logging


class ContextItem:
    """Item individual de contexto."""
    def __init__(self, id: str, content: str, type: str = "SEMANTIC", 
                 relevance_score: float = 0.5, entities: List = None, 
                 metadata: Dict = None, source: str = None):
        self.id = id
        self.content = content
        self.type = type
        self.relevance_score = relevance_score
        self.entities = entities or []
        self.metadata = metadata or {}
        self.source = source
        self.timestamp = datetime.utcnow()


class ContextBundle:
    """Conjunto de contexto seleccionado para una tarea."""
    def __init__(self, id: str, task_id: str, items: List[ContextItem]):
        self.id = id
        self.task_id = task_id
        self.items = items
        self.total_relevance = sum(item.relevance_score for item in items)
        self.compression_ratio = None
        self.explanation = None
        self.created_at = datetime.utcnow()


class TaskRequest:
    """Solicitud de procesamiento de tarea."""
    def __init__(self, id: str, query: str, domain: str = None, 
                 context_types: List[str] = None, max_context_items: int = 10,
                 require_explanation: bool = True, metadata: Dict = None):
        self.id = id
        self.query = query
        self.domain = domain
        self.context_types = context_types or ["SEMANTIC"]
        self.max_context_items = max_context_items
        self.require_explanation = require_explanation
        self.metadata = metadata or {}


class TaskResponse:
    """Respuesta a una tarea procesada."""
    def __init__(self, task_id: str, context_bundle: ContextBundle, 
                 explanation: str = None, processing_time: float = 0,
                 status: str = "completed", metadata: Dict = None):
        self.task_id = task_id
        self.context_bundle = context_bundle
        self.explanation = explanation
        self.processing_time = processing_time
        self.status = status
        self.metadata = metadata or {}


class HexyContextOrchestrator:
    """
    Orquestador principal del sistema de contexto de Hexy.
    
    Coordina:
    - Selección inteligente de contexto
    - Compresión semántica cuando necesario  
    - Generación de explicaciones
    - Gestión de memoria contextual
    - Cache de resultados
    
    Este es el componente diferenciador de Hexy que implementa
    orquestación dinámica y explicable del contexto.
    """
    
    def __init__(self):
        self.logger = logging.getLogger("hexy.context.orchestrator")
        
        # Configuración por defecto
        self.config = {
            "max_memory_items": 1000,
            "default_relevance_threshold": 0.5,
            "compression_enabled": True,
            "max_context_length": 8000,
            "cache_ttl": 3600
        }
        
        # Estado interno
        self._active_tasks: Dict[str, TaskRequest] = {}
        self._memory_cache: Dict[str, ContextBundle] = {}
        self._metrics = {
            "tasks_processed": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "compression_events": 0,
            "explanation_requests": 0
        }
        
        self.logger.info("Context orchestrator initialized")
    
    async def process_task(
        self, 
        task: TaskRequest,
        available_context: List[ContextItem]
    ) -> TaskResponse:
        """
        Procesa una tarea completa de contexto.
        
        Pipeline:
        1. Verificar cache
        2. Seleccionar contexto relevante
        3. Comprimir si es necesario
        4. Generar explicación si se requiere
        5. Almacenar en memoria
        6. Cachear resultado
        
        Args:
            task: Solicitud de tarea
            available_context: Contexto disponible para selección
            
        Returns:
            TaskResponse: Respuesta completa con contexto y explicación
        """
        start_time = time.time()
        
        try:
            self.logger.info(f"Processing task {task.id}: {task.query}")
            
            # Registrar tarea activa
            self._active_tasks[task.id] = task
            
            # 1. Verificar cache primero
            cached_response = await self._check_cache(task)
            if cached_response:
                self.logger.info(f"Task {task.id} served from cache")
                self._metrics["cache_hits"] += 1
                return cached_response
            
            self._metrics["cache_misses"] += 1
            
            # 2. Verificar memoria para contexto similar
            memory_context = await self._check_memory(task)
            if memory_context:
                available_context.extend(memory_context)
            
            # 3. Seleccionar contexto relevante
            context_bundle = await self._select_context(task, available_context)
            
            # 4. Comprimir si es necesario
            if self._should_compress(context_bundle):
                context_bundle = await self._compress_context(context_bundle, task)
            
            # 5. Generar explicación si se requiere
            explanation = None
            if task.require_explanation:
                explanation = await self._generate_explanation(context_bundle, task)
            
            # 6. Crear respuesta
            processing_time = time.time() - start_time
            response = TaskResponse(
                task_id=task.id,
                context_bundle=context_bundle,
                explanation=explanation,
                processing_time=processing_time,
                status="completed",
                metadata={
                    "orchestrator_version": "0.1.0",
                    "compressed": context_bundle.compression_ratio is not None,
                    "explained": explanation is not None
                }
            )
            
            # 7. Almacenar en memoria
            await self._store_in_memory(context_bundle, task)
            
            # 8. Cachear resultado
            await self._cache_response(task, response)
            
            # Actualizar métricas
            self._metrics["tasks_processed"] += 1
            
            self.logger.info(
                f"Task {task.id} processed successfully. "
                f"Selected {len(context_bundle.items)} context items in {processing_time:.2f}s"
            )
            
            return response
            
        except Exception as e:
            self.logger.error(f"Task {task.id} processing failed: {str(e)}")
            raise
        
        finally:
            # Cleanup
            self._active_tasks.pop(task.id, None)
    
    async def _check_cache(self, task: TaskRequest) -> Optional[TaskResponse]:
        """Verifica si hay respuesta cacheada para la tarea."""
        # Implementación simplificada - en producción usaría Redis
        cache_key = self._generate_cache_key(task)
        # return self._cache.get(cache_key) # Redis implementation
        return None  # No cache for now
    
    def _generate_cache_key(self, task: TaskRequest) -> str:
        """Genera clave de cache para una tarea."""
        key_parts = [
            task.query,
            task.domain or "no_domain",
            "_".join(sorted(task.context_types)),
            str(task.max_context_items)
        ]
        key_string = "|".join(key_parts)
        return f"hexy:task:{hash(key_string) & 0xFFFFFFFF:08x}"
    
    async def _check_memory(self, task: TaskRequest) -> List[ContextItem]:
        """Busca contexto similar en memoria."""
        try:
            # Buscar tareas similares en memoria
            for cached_bundle in self._memory_cache.values():
                # Implementación simplificada de similitud
                if self._calculate_query_similarity(task.query, cached_bundle.task_id) > 0.7:
                    self.logger.info(f"Found similar context in memory for task {task.id}")
                    return cached_bundle.items
            
            return []
            
        except Exception as e:
            self.logger.warning(f"Memory check failed: {str(e)}")
            return []
    
    def _calculate_query_similarity(self, query1: str, query2: str) -> float:
        """Calcula similitud básica entre consultas."""
        # Implementación simplificada - en producción usaría embeddings
        words1 = set(query1.lower().split())
        words2 = set(query2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        
        return intersection / union if union > 0 else 0.0
    
    async def _select_context(
        self, 
        task: TaskRequest, 
        available_context: List[ContextItem]
    ) -> ContextBundle:
        """Selecciona contexto relevante usando algoritmo de relevancia."""
        try:
            if not available_context:
                raise Exception(f"No context available for task {task.id}")
            
            # Calcular relevancia para cada item
            scored_items = []
            for item in available_context:
                relevance = await self._calculate_relevance(task, item)
                if relevance >= self.config["default_relevance_threshold"]:
                    item.relevance_score = relevance
                    scored_items.append(item)
            
            if not scored_items:
                raise Exception(f"No relevant context found for task {task.id}")
            
            # Ordenar por relevancia y tomar los top items
            scored_items.sort(key=lambda x: x.relevance_score, reverse=True)
            selected_items = scored_items[:task.max_context_items]
            
            # Crear bundle de contexto
            bundle_id = f"bundle_{uuid.uuid4().hex[:8]}"
            context_bundle = ContextBundle(
                id=bundle_id,
                task_id=task.id,
                items=selected_items
            )
            
            self.logger.info(
                f"Context selection completed for task {task.id}. "
                f"Selected {len(selected_items)} from {len(available_context)} available items"
            )
            
            return context_bundle
            
        except Exception as e:
            self.logger.error(f"Context selection failed for task {task.id}: {str(e)}")
            raise
    
    async def _calculate_relevance(self, task: TaskRequest, item: ContextItem) -> float:
        """Calcula relevancia de un item para una tarea."""
        try:
            # Implementación simplificada de relevancia
            relevance_score = 0.0
            
            # 1. Similitud textual con la query
            query_similarity = self._calculate_query_similarity(task.query, item.content)
            relevance_score += query_similarity * 0.6
            
            # 2. Coincidencia de tipo de contexto
            if item.type in task.context_types:
                relevance_score += 0.3
            
            # 3. Factor de recencia (items más recientes son más relevantes)
            time_diff = (datetime.utcnow() - item.timestamp).total_seconds()
            recency_factor = max(0, 1 - (time_diff / 86400))  # Decay over 24 hours
            relevance_score += recency_factor * 0.1
            
            return min(relevance_score, 1.0)
            
        except Exception as e:
            self.logger.warning(f"Relevance calculation failed: {str(e)}")
            return 0.0
    
    def _should_compress(self, bundle: ContextBundle) -> bool:
        """Determina si el contexto necesita compresión."""
        if not self.config["compression_enabled"]:
            return False
        
        # Calcular tamaño total del contexto
        total_length = sum(len(item.content) for item in bundle.items)
        
        should_compress = total_length > self.config["max_context_length"]
        
        if should_compress:
            self.logger.info(
                f"Context compression needed for bundle {bundle.id}. "
                f"Total length: {total_length}, max: {self.config['max_context_length']}"
            )
        
        return should_compress
    
    async def _compress_context(
        self, 
        bundle: ContextBundle, 
        task: TaskRequest
    ) -> ContextBundle:
        """Comprime el contexto manteniendo información esencial."""
        try:
            # Implementación simplificada de compresión
            target_size = int(self.config["max_context_length"] * 0.8)
            
            # Ordenar items por relevancia
            bundle.items.sort(key=lambda x: x.relevance_score, reverse=True)
            
            # Comprimir contenido de items menos relevantes
            current_size = 0
            compressed_items = []
            
            for item in bundle.items:
                if current_size + len(item.content) <= target_size:
                    # Item completo
                    compressed_items.append(item)
                    current_size += len(item.content)
                else:
                    # Comprimir item
                    remaining_space = target_size - current_size
                    if remaining_space > 100:  # Mínimo espacio útil
                        compressed_content = item.content[:remaining_space-3] + "..."
                        item.content = compressed_content
                        compressed_items.append(item)
                    break
            
            # Crear nuevo bundle comprimido
            original_items = len(bundle.items)
            bundle.items = compressed_items
            bundle.compression_ratio = len(compressed_items) / original_items
            
            self._metrics["compression_events"] += 1
            
            self.logger.info(
                f"Context compression completed for bundle {bundle.id}. "
                f"Compressed from {original_items} to {len(compressed_items)} items"
            )
            
            return bundle
            
        except Exception as e:
            self.logger.error(f"Context compression failed: {str(e)}")
            return bundle  # Return original if compression fails
    
    async def _generate_explanation(
        self, 
        bundle: ContextBundle, 
        task: TaskRequest
    ) -> str:
        """Genera explicación de por qué se seleccionó este contexto."""
        try:
            explanation_parts = [
                f"Selected {len(bundle.items)} context items for task '{task.query}'"
            ]
            
            # Explicar criterios de selección
            if bundle.items:
                avg_relevance = bundle.total_relevance / len(bundle.items)
                explanation_parts.append(
                    f"Average relevance score: {avg_relevance:.2f}"
                )
                
                # Top items explanation
                top_items = sorted(bundle.items, key=lambda x: x.relevance_score, reverse=True)[:3]
                explanation_parts.append("Top relevant items:")
                
                for i, item in enumerate(top_items, 1):
                    content_preview = item.content[:50] + "..." if len(item.content) > 50 else item.content
                    explanation_parts.append(
                        f"  {i}. {content_preview} (relevance: {item.relevance_score:.2f})"
                    )
            
            # Compresión explanation
            if bundle.compression_ratio:
                explanation_parts.append(
                    f"Context was compressed (ratio: {bundle.compression_ratio:.2f}) "
                    f"to fit within length limits"
                )
            
            self._metrics["explanation_requests"] += 1
            
            explanation = ". ".join(explanation_parts)
            
            self.logger.info(f"Explanation generated for bundle {bundle.id}")
            
            return explanation
            
        except Exception as e:
            self.logger.error(f"Explanation generation failed: {str(e)}")
            return "Explanation generation failed"
    
    async def _store_in_memory(self, bundle: ContextBundle, task: TaskRequest) -> None:
        """Almacena el contexto en memoria para futuro uso."""
        try:
            # Limitar tamaño de memoria
            if len(self._memory_cache) >= self.config["max_memory_items"]:
                # Remover el más antiguo
                oldest_key = min(self._memory_cache.keys(), 
                               key=lambda k: self._memory_cache[k].created_at)
                del self._memory_cache[oldest_key]
            
            self._memory_cache[bundle.id] = bundle
            
            self.logger.debug(f"Context bundle {bundle.id} stored in memory")
            
        except Exception as e:
            self.logger.warning(f"Memory storage failed: {str(e)}")
    
    async def _cache_response(self, task: TaskRequest, response: TaskResponse) -> None:
        """Cachea la respuesta de la tarea."""
        try:
            cache_key = self._generate_cache_key(task)
            # En producción: await self._cache.set(cache_key, response, ttl=self.config["cache_ttl"])
            
            self.logger.debug(f"Response cached for task {task.id}")
            
        except Exception as e:
            self.logger.warning(f"Response caching failed: {str(e)}")
    
    def get_metrics(self) -> Dict[str, Any]:
        """Obtiene métricas del orquestador."""
        hit_rate = (
            self._metrics["cache_hits"] / 
            (self._metrics["cache_hits"] + self._metrics["cache_misses"])
            if (self._metrics["cache_hits"] + self._metrics["cache_misses"]) > 0
            else 0.0
        )
        
        return {
            **self._metrics,
            "active_tasks": len(self._active_tasks),
            "memory_items": len(self._memory_cache),
            "cache_hit_rate": hit_rate
        }
    
    def get_active_tasks(self) -> List[str]:
        """Lista de IDs de tareas activas."""
        return list(self._active_tasks.keys())
    
    async def cleanup_old_data(self, max_age_hours: int = 24) -> Dict[str, int]:
        """Limpia datos antiguos de memoria."""
        cleanup_results = {"memory_items_cleaned": 0}
        
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
            
            old_bundles = [
                bundle_id for bundle_id, bundle in self._memory_cache.items()
                if bundle.created_at < cutoff_time
            ]
            
            for bundle_id in old_bundles:
                del self._memory_cache[bundle_id]
                cleanup_results["memory_items_cleaned"] += 1
            
            self.logger.info(
                f"Cleanup completed: removed {cleanup_results['memory_items_cleaned']} old items"
            )
            
        except Exception as e:
            self.logger.warning(f"Cleanup failed: {str(e)}")
        
        return cleanup_results
    
    async def shutdown(self) -> None:
        """Cierre limpio del orquestador."""
        if self._active_tasks:
            self.logger.warning(
                f"Shutting down with {len(self._active_tasks)} active tasks"
            )
        
        self._active_tasks.clear()
        
        self.logger.info(
            f"Orchestrator shutdown completed. Final metrics: {self.get_metrics()}"
        )
    
    def __repr__(self) -> str:
        return (
            f"HexyContextOrchestrator("
            f"active_tasks={len(self._active_tasks)}, "
            f"memory_items={len(self._memory_cache)}, "
            f"tasks_processed={self._metrics['tasks_processed']})"
        )