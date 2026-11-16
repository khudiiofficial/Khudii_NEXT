import React from 'react';
import { GripVertical, ChevronUp, ChevronDown, Sliders, ExternalLink, Copy, Pencil, Trash2 } from 'lucide-react';
import AdminPublishSwitch from '@/components/AdminPublishSwitch';
import AdminIconAction from '@/components/AdminIconAction';

const SuccessStoryList = ({ stories, onEdit, onDuplicate, onDelete, onMove, onToggle, onDropRow, onSeo, dragId, ordering }) => {
  if (stories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No success stories found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating your first success story.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold">Order</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-[#222222] uppercase tracking-wider">
                Video
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-[#222222] uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-[#222222] uppercase tracking-wider">
                YouTube ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-[#222222] uppercase tracking-wider">
                Description
              </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-[#222222] uppercase tracking-wider">
                slug
              </th>
              <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-[#222222] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {stories.map((story,index) => (
              <tr key={story.id} draggable={!ordering} onDragStart={e=>{dragId.current=story.id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(story.id));}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';}} onDrop={e=>{e.preventDefault();onDropRow(dragId.current,index);dragId.current=null;}} onDragEnd={()=>{dragId.current=null;}} className="hover:bg-blue-50/40">
                <td className="px-3 py-4"><div className="flex items-center gap-1"><GripVertical size={17} aria-label="Drag to reorder" className="cursor-grab text-slate-400"/><span className="text-xs text-slate-500">{index+1}</span><div className="flex flex-col gap-1"><button type="button" disabled={!index||ordering} aria-label={`Move ${story.title} up`} onClick={()=>onMove(index,index-1)} className="disabled:opacity-30"><ChevronUp size={14}/></button><button type="button" disabled={index===stories.length-1||ordering} aria-label={`Move ${story.title} down`} onClick={()=>onMove(index,index+1)} className="disabled:opacity-30"><ChevronDown size={14}/></button></div></div></td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${story.youtube_id}/hqdefault.jpg`}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{story.title}</div>
                  {story.urdu_title && (
                    <div className="text-sm text-gray-500 mt-1">{story.urdu_title}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{story.youtube_id}</code>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {story.description || 'No description'}
                  </div>
                </td>

                  <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {story.slug ?<i className="fa-solid fa-circle-check text-2xl" style={{ color: "#1c5e20" }}></i>:<i className="fa-solid fa-circle-xmark text-2xl" style={{ color: "#ff0000" }}></i>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2 items-center"><AdminIconAction action={Boolean(story.is_published)?'hide':'show'} disabled={ordering} onClick={()=>onToggle(story,!Boolean(story.is_published))} label={`${Boolean(story.is_published)?'Hide':'Publish'} ${story.title}`}/><span className={`kh-status-chip ${Boolean(story.is_published)?'is-live':'is-draft'}`}>{Boolean(story.is_published)?'Published':'Draft'}</span></div>

                  <div className="flex items-center justify-end gap-2 mt-2">
                    {/* Preview on live site */}
                    <a
                      href={`/success-stories/${story.slug || story.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View live story"
                      className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#02236E]"
                    >
                      <ExternalLink size={15} />
                    </a>

                    {/* SEO Center */}
                    <button
                      type="button"
                      onClick={() => onSeo && onSeo(story)}
                      title={`Open SEO Center for ${story.title}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      <Sliders size={13} />
                      SEO Center
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => onDuplicate(story)}
                      disabled={ordering}
                      title={`Duplicate ${story.title}`}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 disabled:opacity-40"
                    >
                      <Copy size={14} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit(story)}
                      title={`Edit ${story.title}`}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-[#02236E] hover:bg-blue-100 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete(story.id)}
                      disabled={ordering}
                      title={`Delete ${story.title}`}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuccessStoryList;