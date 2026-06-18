import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { Users, Search, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Alert from '../components/ui/Alert';

const PatientManagement = () => {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await API.get('/patients');
      setPatients(response.data.sort((a, b) =>
        `${a.user?.firstName} ${a.user?.lastName}`.localeCompare(`${b.user?.firstName} ${b.user?.lastName}`)
      ));
    } catch (err) {
      setError('Failed to load patient records.');
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this patient record and all associated clinic history?')) {
      try {
        await API.delete(`/patients/${id}`);
        toast.success('Patient record deleted successfully');
        fetchPatients();
      } catch (err) {
        toast.error('Failed to delete patient profile.');
      }
    }
  };

  const filteredPatients = patients.filter(pat => {
    const fullName = `${pat.user?.firstName} ${pat.user?.lastName}`.toLowerCase();
    const phone = pat.phone.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || phone.includes(query);
  });

  return (
    <Card>
      <CardHeader className="flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>Manage hospital clients, demographics and metrics</CardDescription>
        </div>
        
        {/* Search */}
        <div className="w-full md:w-64">
          <Input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="danger" title="System Error">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2">
            <Spinner />
            <p className="text-slate-400 text-xs">Loading patient registry logs...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            title="No Patients Found"
            description={searchQuery ? `No matching patient records found for "${searchQuery}".` : "There are no patients currently registered."}
            icon={Users}
          />
        ) : (
          <Table className="min-w-[800px]">
            <THead>
              <TR>
                <TH>Patient Name</TH>
                <TH>Gender</TH>
                <TH>Date of Birth</TH>
                <TH>Phone</TH>
                <TH>Address</TH>
                <TH className="text-center">Blood</TH>
                <TH className="text-center">Action</TH>
              </TR>
            </THead>
            <TBody>
              {filteredPatients.map((pat) => (
                <TR key={pat.id}>
                  <TD className="font-bold text-slate-800">
                    {pat.user?.firstName} {pat.user?.lastName}
                  </TD>
                  <TD className="text-slate-500 font-medium">{pat.gender}</TD>
                  <TD className="text-slate-500 font-medium">{pat.dateOfBirth}</TD>
                  <TD className="text-slate-500 font-medium">{pat.phone}</TD>
                  <TD className="text-slate-500 font-medium max-w-xs truncate">{pat.address}</TD>
                  <TD className="text-center">
                    <Badge variant="neutral">
                      {pat.bloodType || 'N/A'}
                    </Badge>
                  </TD>
                  <TD className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                      onClick={() => handleDelete(pat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientManagement;
