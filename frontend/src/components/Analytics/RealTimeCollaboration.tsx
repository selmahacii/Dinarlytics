import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  ShareIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  HeartIcon,
  StarIcon,
  BellIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import GlassmorphismCard from '../Effects/GlassmorphismCard';
import Modal from '../UI/Modal';

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  type: 'comment' | 'suggestion' | 'question' | 'approval';
  status: 'active' | 'resolved' | 'archived';
  replies: Comment[];
  likes: number;
  isLiked: boolean;
  mentions: string[];
}

interface Version {
  id: string;
  number: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  changes: string[];
  timestamp: string;
  isCurrent: boolean;
  comment: string;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: string;
  permissions: ('view' | 'comment' | 'edit' | 'admin')[];
  isOnline: boolean;
  lastSeen: string;
  currentActivity: string;
}

interface RealTimeCollaborationProps {
  isVisible?: boolean;
  showGlassmorphism?: boolean;
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({ 
  isVisible = true, 
  showGlassmorphism = true 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [activeTab, setActiveTab] = useState<'comments' | 'versions' | 'collaborators'>('comments');
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'suggestion' | 'question' | 'approval'>('comment');
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>('');

  // Données de démonstration
  const demoComments: Comment[] = [
    {
      id: '1',
      author: {
        id: 'user1',
        name: 'Marie Dubois',
        avatar: '👩‍💼',
        role: 'Manager'
      },
      content: 'Excellent rapport ! Les métriques de rétention sont très encourageantes. Pourriez-vous ajouter une comparaison avec le trimestre précédent ?',
      timestamp: '2024-01-15 14:30',
      type: 'suggestion',
      status: 'active',
      replies: [
        {
          id: '1-1',
          author: {
            id: 'user2',
            name: 'Ahmed Benali',
            avatar: '👨‍💻',
            role: 'Analyste'
          },
          content: 'Bonne idée ! Je vais ajouter cette comparaison dans la prochaine version.',
          timestamp: '2024-01-15 14:35',
          type: 'comment',
          status: 'active',
          replies: [],
          likes: 2,
          isLiked: true,
          mentions: []
        }
      ],
      likes: 5,
      isLiked: true,
      mentions: ['@ahmed']
    },
    {
      id: '2',
      author: {
        id: 'user3',
        name: 'Sophie Martin',
        avatar: '👩‍🔬',
        role: 'Data Scientist'
      },
      content: 'Les corrélations entre satisfaction client et rétention sont très intéressantes. Cela confirme nos hypothèses !',
      timestamp: '2024-01-15 13:45',
      type: 'approval',
      status: 'active',
      replies: [],
      likes: 3,
      isLiked: false,
      mentions: []
    },
    {
      id: '3',
      author: {
        id: 'user4',
        name: 'Pierre Leroy',
        avatar: '👨‍💼',
        role: 'Directeur'
      },
      content: 'Question : Comment expliquer la baisse du taux de conversion en mars ? Y a-t-il des facteurs externes à considérer ?',
      timestamp: '2024-01-15 12:20',
      type: 'question',
      status: 'active',
      replies: [],
      likes: 1,
      isLiked: false,
      mentions: ['@marie', '@ahmed']
    }
  ];

  const demoVersions: Version[] = [
    {
      id: '1',
      number: 'v2.1',
      author: {
        id: 'user2',
        name: 'Ahmed Benali',
        avatar: '👨‍💻'
      },
      changes: [
        'Ajout de la comparaison trimestrielle',
        'Amélioration des graphiques de rétention',
        'Correction des métriques de churn'
      ],
      timestamp: '2024-01-15 15:00',
      isCurrent: true,
      comment: 'Version finale avec toutes les suggestions intégrées'
    },
    {
      id: '2',
      number: 'v2.0',
      author: {
        id: 'user2',
        name: 'Ahmed Benali',
        avatar: '👨‍💻'
      },
      changes: [
        'Ajout de l\'analyse de cohorte',
        'Nouveaux KPIs de performance',
        'Interface utilisateur améliorée'
      ],
      timestamp: '2024-01-14 16:30',
      isCurrent: false,
      comment: 'Version majeure avec nouvelles fonctionnalités'
    },
    {
      id: '3',
      number: 'v1.9',
      author: {
        id: 'user1',
        name: 'Marie Dubois',
        avatar: '👩‍💼'
      },
      changes: [
        'Correction des bugs de calcul',
        'Optimisation des performances',
        'Mise à jour des données'
      ],
      timestamp: '2024-01-13 14:15',
      isCurrent: false,
      comment: 'Version de maintenance'
    }
  ];

  const demoCollaborators: Collaborator[] = [
    {
      id: 'user1',
      name: 'Marie Dubois',
      avatar: '👩‍💼',
      role: 'Manager',
      permissions: ['view', 'comment', 'edit', 'admin'],
      isOnline: true,
      lastSeen: 'Maintenant',
      currentActivity: 'Consulte le rapport de vente'
    },
    {
      id: 'user2',
      name: 'Ahmed Benali',
      avatar: '👨‍💻',
      role: 'Analyste',
      permissions: ['view', 'comment', 'edit'],
      isOnline: true,
      lastSeen: 'Maintenant',
      currentActivity: 'Modifie le tableau de bord'
    },
    {
      id: 'user3',
      name: 'Sophie Martin',
      avatar: '👩‍🔬',
      role: 'Data Scientist',
      permissions: ['view', 'comment'],
      isOnline: false,
      lastSeen: 'Il y a 2 heures',
      currentActivity: 'En pause'
    },
    {
      id: 'user4',
      name: 'Pierre Leroy',
      avatar: '👨‍💼',
      role: 'Directeur',
      permissions: ['view', 'comment'],
      isOnline: true,
      lastSeen: 'Maintenant',
      currentActivity: 'Examine les métriques'
    }
  ];

  useEffect(() => {
    setComments(demoComments);
    setVersions(demoVersions);
    setCollaborators(demoCollaborators);
  }, []);

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'comment': return 'bg-blue-100 text-blue-800';
      case 'suggestion': return 'bg-green-100 text-green-800';
      case 'question': return 'bg-yellow-100 text-yellow-800';
      case 'approval': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'comment': return <ChatBubbleLeftIcon className="h-4 w-4" />;
      case 'suggestion': return <PencilIcon className="h-4 w-4" />;
      case 'question': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'approval': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <ChatBubbleLeftIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: {
        id: 'current-user',
        name: 'Vous',
        avatar: '👤',
        role: 'Utilisateur'
      },
      content: newComment,
      timestamp: new Date().toLocaleString('fr-FR'),
      type: commentType,
      status: 'active',
      replies: [],
      likes: 0,
      isLiked: false,
      mentions: []
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setIsCommentModalOpen(false);
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked
        };
      }
      return comment;
    }));
  };

  const handleResolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, status: 'resolved' as const };
      }
      return comment;
    }));
  };

  const handleRestoreVersion = (versionId: string) => {
    setVersions(prev => prev.map(version => ({
      ...version,
      isCurrent: version.id === versionId
    })));
  };

  const onlineCollaborators = collaborators.filter(c => c.isOnline).length;
  const activeComments = comments.filter(c => c.status === 'active').length;
  const totalVersions = versions.length;

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <UserGroupIcon className="h-6 w-6 text-green-600" />
            <span>🤝 Collaboration en Temps Réel</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Commentaires, annotations et historique des versions avec partage collaboratif
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCommentModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nouveau Commentaire</span>
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <ShareIcon className="h-5 w-5" />
            <span>Partager</span>
          </button>
        </div>
      </div>

      {/* Métriques de collaboration */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {showGlassmorphism ? (
          <>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Collaborateurs en ligne</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{onlineCollaborators}</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-green-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Commentaires actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeComments}</p>
                </div>
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Versions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalVersions}</p>
                </div>
                <DocumentTextIcon className="h-8 w-8 text-purple-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">87%</p>
                </div>
                <HeartIcon className="h-8 w-8 text-red-500" />
              </div>
            </GlassmorphismCard>
          </>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Collaborateurs en ligne</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{onlineCollaborators}</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Commentaires actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeComments}</p>
                </div>
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Versions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalVersions}</p>
                </div>
                <DocumentTextIcon className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">87%</p>
                </div>
                <HeartIcon className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'comments', label: 'Commentaires', icon: ChatBubbleLeftRightIcon },
            { id: 'versions', label: 'Versions', icon: DocumentTextIcon },
            { id: 'collaborators', label: 'Collaborateurs', icon: UserGroupIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              💬 Commentaires et Annotations ({comments.length})
            </h3>
            <div className="flex space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option>Tous les statuts</option>
                <option>Actifs</option>
                <option>Résolus</option>
                <option>Archivés</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option>Tous les types</option>
                <option>Commentaires</option>
                <option>Suggestions</option>
                <option>Questions</option>
                <option>Approbations</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              showGlassmorphism ? (
                <GlassmorphismCard key={comment.id} intensity="medium" className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{comment.author.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {comment.author.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {comment.author.role} • {comment.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCommentTypeColor(comment.type)}`}>
                        <span className="flex items-center space-x-1">
                          {getCommentTypeIcon(comment.type)}
                          <span>
                            {comment.type === 'comment' ? 'Commentaire' :
                             comment.type === 'suggestion' ? 'Suggestion' :
                             comment.type === 'question' ? 'Question' : 'Approbation'}
                          </span>
                        </span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comment.status)}`}>
                        {comment.status === 'active' ? 'Actif' :
                         comment.status === 'resolved' ? 'Résolu' : 'Archivé'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    {comment.mentions.length > 0 && (
                      <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                        Mentions: {comment.mentions.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center space-x-1 text-sm ${
                          comment.isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <HeartIcon className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        <span>{comment.replies.length}</span>
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      {comment.status === 'active' && (
                        <button
                          onClick={() => handleResolveComment(comment.id)}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium hover:bg-green-200"
                        >
                          Résoudre
                        </button>
                      )}
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200">
                        Répondre
                      </button>
                    </div>
                  </div>

                  {/* Réponses */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="text-lg">{reply.author.avatar}</div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {reply.author.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {reply.timestamp}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => handleLikeComment(reply.id)}
                              className={`flex items-center space-x-1 text-xs ${
                                reply.isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              <HeartIcon className={`h-3 w-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                              <span>{reply.likes}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassmorphismCard>
              ) : (
                <Card key={comment.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{comment.author.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {comment.author.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {comment.author.role} • {comment.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCommentTypeColor(comment.type)}`}>
                        <span className="flex items-center space-x-1">
                          {getCommentTypeIcon(comment.type)}
                          <span>
                            {comment.type === 'comment' ? 'Commentaire' :
                             comment.type === 'suggestion' ? 'Suggestion' :
                             comment.type === 'question' ? 'Question' : 'Approbation'}
                          </span>
                        </span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comment.status)}`}>
                        {comment.status === 'active' ? 'Actif' :
                         comment.status === 'resolved' ? 'Résolu' : 'Archivé'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    {comment.mentions.length > 0 && (
                      <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                        Mentions: {comment.mentions.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center space-x-1 text-sm ${
                          comment.isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <HeartIcon className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                        <span>{comment.replies.length}</span>
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      {comment.status === 'active' && (
                        <button
                          onClick={() => handleResolveComment(comment.id)}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium hover:bg-green-200"
                        >
                          Résoudre
                        </button>
                      )}
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200">
                        Répondre
                      </button>
                    </div>
                  </div>

                  {/* Réponses */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="text-lg">{reply.author.avatar}</div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {reply.author.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {reply.timestamp}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => handleLikeComment(reply.id)}
                              className={`flex items-center space-x-1 text-xs ${
                                reply.isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              <HeartIcon className={`h-3 w-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                              <span>{reply.likes}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )
            ))}
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📚 Historique des Versions ({versions.length})
          </h3>
          
          <div className="space-y-3">
            {versions.map((version) => (
              showGlassmorphism ? (
                <GlassmorphismCard 
                  key={version.id} 
                  intensity="medium" 
                  className={`p-4 ${
                    version.isCurrent ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{version.author.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          Version {version.number}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          par {version.author.name} • {version.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {version.isCurrent && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Version actuelle
                        </span>
                      )}
                      {!version.isCurrent && (
                        <button
                          onClick={() => handleRestoreVersion(version.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
                        >
                          Restaurer
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{version.comment}</p>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Modifications:</div>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {version.changes.map((change, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircleIcon className="h-3 w-3 text-green-500" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassmorphismCard>
              ) : (
                <Card 
                  key={version.id} 
                  className={`p-4 ${
                    version.isCurrent ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{version.author.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          Version {version.number}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          par {version.author.name} • {version.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {version.isCurrent && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Version actuelle
                        </span>
                      )}
                      {!version.isCurrent && (
                        <button
                          onClick={() => handleRestoreVersion(version.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
                        >
                          Restaurer
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{version.comment}</p>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Modifications:</div>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {version.changes.map((change, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircleIcon className="h-3 w-3 text-green-500" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )
            ))}
          </div>
        </div>
      )}

      {activeTab === 'collaborators' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            👥 Collaborateurs ({collaborators.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collaborators.map((collaborator) => (
              showGlassmorphism ? (
                <GlassmorphismCard key={collaborator.id} intensity="medium" className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{collaborator.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {collaborator.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {collaborator.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-xs text-gray-500">
                        {collaborator.isOnline ? 'En ligne' : collaborator.lastSeen}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Activité actuelle:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {collaborator.currentActivity}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Permissions:</span>
                      <div className="flex space-x-1 mt-1">
                        {collaborator.permissions.map((permission) => (
                          <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {permission === 'view' ? 'Voir' :
                             permission === 'comment' ? 'Commenter' :
                             permission === 'edit' ? 'Modifier' : 'Admin'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassmorphismCard>
              ) : (
                <Card key={collaborator.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{collaborator.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {collaborator.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {collaborator.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-xs text-gray-500">
                        {collaborator.isOnline ? 'En ligne' : collaborator.lastSeen}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Activité actuelle:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {collaborator.currentActivity}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Permissions:</span>
                      <div className="flex space-x-1 mt-1">
                        {collaborator.permissions.map((permission) => (
                          <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {permission === 'view' ? 'Voir' :
                             permission === 'comment' ? 'Commenter' :
                             permission === 'edit' ? 'Modifier' : 'Admin'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            ))}
          </div>
        </div>
      )}

      {/* Modal pour ajouter un commentaire */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        title="Nouveau Commentaire"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de commentaire</label>
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="comment">Commentaire</option>
              <option value="suggestion">Suggestion</option>
              <option value="question">Question</option>
              <option value="approval">Approbation</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={4}
              placeholder="Tapez votre commentaire..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mentionner</label>
            <select
              value={selectedCollaborator}
              onChange={(e) => setSelectedCollaborator(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Aucune mention</option>
              {collaborators.map(collaborator => (
                <option key={collaborator.id} value={collaborator.id}>
                  {collaborator.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCommentModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Publier
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de partage */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Partager le Rapport"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="view">Lecture seule</option>
              <option value="comment">Lecture + Commentaires</option>
              <option value="edit">Lecture + Modification</option>
              <option value="admin">Accès complet</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Collaborateurs</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {collaborators.map(collaborator => (
                <label key={collaborator.id} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">{collaborator.name}</span>
                  <span className="text-xs text-gray-500">({collaborator.role})</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien de partage</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value="https://rapport.dinarlytic.com/share/abc123"
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                Copier
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Partager
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RealTimeCollaboration;
